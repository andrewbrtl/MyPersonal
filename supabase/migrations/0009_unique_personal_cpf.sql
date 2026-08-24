-- O CPF nunca é salvo em texto puro. A aplicação envia apenas uma assinatura HMAC
-- determinística, suficiente para impedir duas contas profissionais com o mesmo CPF.

create table public.identidades_personais (
  personal_id uuid primary key references public.personais(id) on delete cascade,
  cpf_fingerprint text not null unique
    check (cpf_fingerprint ~ '^[0-9a-f]{64}$'),
  criado_em timestamptz not null default now()
);

alter table public.identidades_personais enable row level security;
revoke all on table public.identidades_personais from public, anon, authenticated;
grant select, insert, delete on table public.identidades_personais to service_role;

comment on table public.identidades_personais is 'Identificador privado e não reversível usado para impedir contas profissionais duplicadas por CPF.';
comment on column public.identidades_personais.cpf_fingerprint is 'HMAC-SHA-256 do CPF; o número original não é persistido.';

alter table public.validacoes_cref9
  add column cpf_fingerprint text;

-- Os passes duram poucos minutos e podem ser descartados durante a migração.
delete from public.validacoes_cref9;

alter table public.validacoes_cref9
  alter column cpf_fingerprint set not null,
  add constraint validacoes_cref9_cpf_fingerprint_check
    check (cpf_fingerprint ~ '^[0-9a-f]{64}$');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  novo_role public.user_role;
  novo_nome text;
  novo_cref text;
  novo_telefone text;
  token_texto text;
  validacao public.validacoes_cref9%rowtype;
begin
  novo_nome := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
    split_part(coalesce(new.email, 'Usuário'), '@', 1)
  );
  novo_cref := nullif(upper(trim(new.raw_user_meta_data ->> 'cref')), '');
  novo_telefone := nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'telefone', ''), '[^0-9]', '', 'g'), '');

  if char_length(novo_telefone) in (12, 13) and novo_telefone like '55%' then
    novo_telefone := substring(novo_telefone from 3);
  end if;

  if novo_telefone is not null and novo_telefone !~ '^\d{10,11}$' then
    raise exception 'Telefone com DDD inválido.';
  end if;

  if new.raw_user_meta_data ->> 'role' = 'personal' then
    novo_role := 'personal'::public.user_role;
    token_texto := nullif(new.raw_user_meta_data ->> 'cref_validation_token', '');

    if novo_cref is null
       or token_texto is null
       or token_texto !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      raise exception 'Validação profissional obrigatória para contas de personal.';
    end if;

    delete from public.validacoes_cref9
    where token = token_texto::uuid
      and lower(email) = lower(coalesce(new.email, ''))
      and nome_informado = novo_nome
      and cref = novo_cref
      and situacao = 'ATIVO'
      and cpf_fingerprint ~ '^[0-9a-f]{64}$'
      and expira_em > now()
    returning * into validacao;

    if not found then
      raise exception 'Validação profissional inválida ou expirada.';
    end if;
  else
    novo_role := 'aluno'::public.user_role;
  end if;

  insert into public.profiles (id, role, nome, telefone)
  values (new.id, novo_role, novo_nome, novo_telefone);

  if novo_role = 'personal' then
    insert into public.personais (
      id,
      cref,
      nome_oficial_cref,
      categoria_cref,
      situacao_cref,
      cref_verificado_em
    ) values (
      new.id,
      novo_cref,
      validacao.nome_oficial,
      validacao.categoria,
      validacao.situacao,
      now()
    );

    insert into public.identidades_personais (personal_id, cpf_fingerprint)
    values (new.id, validacao.cpf_fingerprint);
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
