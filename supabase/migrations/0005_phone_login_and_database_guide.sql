-- Login por telefone e uma camada de leitura com nomes simples em português.
-- As tabelas existentes não são renomeadas para preservar API, políticas e histórico.

update public.profiles
set telefone = case
  when char_length(regexp_replace(telefone, '[^0-9]', '', 'g')) in (12, 13)
       and regexp_replace(telefone, '[^0-9]', '', 'g') like '55%'
    then substring(regexp_replace(telefone, '[^0-9]', '', 'g') from 3)
  else regexp_replace(telefone, '[^0-9]', '', 'g')
end
where telefone is not null;

alter table public.profiles
  drop constraint if exists profiles_telefone_formato_check;

alter table public.profiles
  add constraint profiles_telefone_formato_check
    check (telefone is null or telefone ~ '^\d{10,11}$');

create unique index if not exists profiles_telefone_unico_idx
  on public.profiles (telefone)
  where telefone is not null;

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
begin
  novo_role := case
    when new.raw_user_meta_data ->> 'role' = 'personal' then 'personal'::public.user_role
    else 'aluno'::public.user_role
  end;

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

  if novo_role = 'personal' and novo_cref is null then
    raise exception 'CREF obrigatório para contas profissionais.';
  end if;

  insert into public.profiles (id, role, nome, telefone)
  values (new.id, novo_role, novo_nome, novo_telefone);

  if novo_role = 'personal' then
    insert into public.personais (id, cref) values (new.id, novo_cref);
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

comment on table public.profiles is 'Usuários: dados básicos compartilhados por alunos e profissionais. O nome técnico profiles foi mantido para não quebrar a aplicação.';
comment on column public.profiles.role is 'Tipo da conta: aluno, personal ou admin.';
comment on column public.profiles.telefone is 'Telefone nacional com DDD, somente números. É único e também pode ser usado para entrar.';
comment on table public.personais is 'Perfis profissionais: apresentação, CREF, preço, atendimento e redes sociais.';
comment on table public.modalidades is 'Modalidades esportivas disponíveis para os profissionais.';
comment on table public.personal_modalidades is 'Ligação entre um profissional e as modalidades que ele oferece.';
comment on table public.personal_fotos is 'Fotos adicionais dos perfis profissionais.';
comment on table public.planos is 'Planos comerciais disponíveis na plataforma.';
comment on table public.assinaturas is 'Assinaturas dos profissionais e seus estados de pagamento.';
comment on table public.avaliacoes is 'Avaliações deixadas por alunos para profissionais.';
comment on table public.favoritos is 'Profissionais salvos por cada aluno.';
comment on table public.contatos is 'Cliques em telefone ou WhatsApp recebidos pelos profissionais.';
comment on table public.asaas_webhook_eventos is 'Eventos técnicos recebidos do sistema de pagamentos Asaas.';

create or replace view public.usuarios
with (security_invoker = true)
as
select
  id,
  role as tipo_conta,
  nome,
  telefone,
  avatar_url as foto,
  cidade,
  estado,
  criado_em
from public.profiles;

comment on view public.usuarios is 'Visão simples e somente para leitura dos dados básicos de usuários. A aplicação continua usando profiles internamente.';
revoke all on public.usuarios from anon, authenticated;
grant select on public.usuarios to authenticated;

create or replace view public.resumo_personais
with (security_invoker = true)
as
select
  p.id,
  u.nome,
  u.telefone,
  u.cidade,
  u.estado,
  p.cref,
  p.bairro,
  p.bio as descricao,
  p.formacao,
  p.anos_experiencia as experiencia_anos,
  p.preco_mensal_base as preco_mensal,
  p.atendimento,
  p.perfil_publico as publicado,
  p.nota_media as avaliacao,
  p.total_avaliacoes as quantidade_avaliacoes,
  p.criado_em
from public.personais p
join public.profiles u on u.id = p.id;

comment on view public.resumo_personais is 'Visão simples e somente para leitura dos principais dados de profissionais.';
revoke all on public.resumo_personais from anon, authenticated;
grant select on public.resumo_personais to authenticated;
