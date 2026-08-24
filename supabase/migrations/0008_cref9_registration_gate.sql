-- Só permite criar contas profissionais depois de uma consulta CREF9 feita pelo servidor.
-- O passe é descartável, expira rapidamente e nunca é exposto aos papéis públicos da API.

create table public.validacoes_cref9 (
  token uuid primary key,
  email text not null check (char_length(email) between 3 and 254),
  nome_informado text not null check (char_length(nome_informado) between 2 and 120),
  cref text not null check (cref ~ '^\d{4,8}-[A-Z]/PR$'),
  nome_oficial text not null check (char_length(nome_oficial) between 2 and 180),
  categoria text not null check (char_length(categoria) between 2 and 100),
  situacao text not null check (situacao = 'ATIVO'),
  expira_em timestamptz not null,
  criado_em timestamptz not null default now()
);

alter table public.validacoes_cref9 enable row level security;
revoke all on table public.validacoes_cref9 from public, anon, authenticated;
grant select, insert, delete on table public.validacoes_cref9 to service_role;

comment on table public.validacoes_cref9 is 'Passes descartáveis emitidos pelo servidor após consulta pública ao CREF9/PR.';

alter table public.personais
  add column if not exists nome_oficial_cref text,
  add column if not exists categoria_cref text,
  add column if not exists situacao_cref text,
  add column if not exists cref_verificado_em timestamptz;

alter table public.personais
  drop constraint if exists personais_situacao_cref_check;

alter table public.personais
  add constraint personais_situacao_cref_check
    check (situacao_cref is null or situacao_cref = 'ATIVO');

comment on column public.personais.nome_oficial_cref is 'Nome retornado pela consulta pública do CREF9 no momento do cadastro.';
comment on column public.personais.cref_verificado_em is 'Data da última validação do registro profissional antes da criação da conta.';

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
      raise exception 'Validação CREF9 obrigatória para contas profissionais.';
    end if;

    delete from public.validacoes_cref9
    where token = token_texto::uuid
      and lower(email) = lower(coalesce(new.email, ''))
      and nome_informado = novo_nome
      and cref = novo_cref
      and situacao = 'ATIVO'
      and expira_em > now()
    returning * into validacao;

    if not found then
      raise exception 'Validação CREF9 inválida ou expirada.';
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
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

-- Bilhetes expirados não concedem acesso; esta limpeza evita acúmulo sem depender de cron.
delete from public.validacoes_cref9 where expira_em <= now();
