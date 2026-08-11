-- Marketplace de personais — migration inicial revisada
-- Supabase/Postgres + PostGIS

create extension if not exists pgcrypto;
create extension if not exists postgis;

create type public.user_role as enum ('aluno', 'personal', 'admin');
create type public.modalidade_local as enum ('presencial', 'online', 'ambos');
create type public.status_assinatura as enum ('ativa', 'pendente', 'atrasada', 'cancelada', 'expirada');
create type public.tipo_plano as enum ('gratuito', 'profissional', 'premium');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  nome text not null check (char_length(trim(nome)) between 2 and 120),
  telefone text,
  avatar_url text,
  cidade text not null default 'Guarapuava',
  estado text not null default 'PR' check (char_length(estado) = 2),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.modalidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  categoria text not null,
  icone text,
  ativo boolean not null default true
);

create table public.personais (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  formacao text,
  anos_experiencia integer check (anos_experiencia between 0 and 80),
  preco_mensal_base numeric(10,2) check (preco_mensal_base >= 0),
  atendimento public.modalidade_local not null default 'presencial',
  localizacao geography(Point, 4326),
  raio_atendimento_km integer not null default 10 check (raio_atendimento_km between 1 and 200),
  video_apresentacao_url text,
  perfil_publico boolean not null default false,
  nota_media numeric(2,1) not null default 0 check (nota_media between 0 and 5),
  total_avaliacoes integer not null default 0 check (total_avaliacoes >= 0),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index personais_localizacao_idx on public.personais using gist (localizacao);
create index personais_perfil_publico_idx on public.personais (perfil_publico) where perfil_publico;

create table public.personal_modalidades (
  personal_id uuid not null references public.personais(id) on delete cascade,
  modalidade_id uuid not null references public.modalidades(id) on delete cascade,
  preco_especifico numeric(10,2) check (preco_especifico >= 0),
  primary key (personal_id, modalidade_id)
);

create index personal_modalidades_modalidade_idx
  on public.personal_modalidades (modalidade_id, personal_id);

create table public.personal_fotos (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references public.personais(id) on delete cascade,
  storage_path text not null,
  texto_alternativo text,
  ordem smallint not null default 0 check (ordem >= 0),
  capa boolean not null default false,
  criado_em timestamptz not null default now(),
  unique (personal_id, storage_path)
);

create unique index personal_fotos_capa_unica_idx
  on public.personal_fotos (personal_id)
  where capa;

create table public.planos (
  id uuid primary key default gen_random_uuid(),
  tipo public.tipo_plano not null unique,
  nome text not null,
  preco_mensal numeric(10,2) not null check (preco_mensal >= 0),
  descricao text,
  beneficios jsonb not null default '[]'::jsonb check (jsonb_typeof(beneficios) = 'array'),
  ativo boolean not null default true
);

create table public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references public.personais(id) on delete cascade,
  plano_id uuid not null references public.planos(id),
  asaas_subscription_id text unique,
  asaas_customer_id text,
  status public.status_assinatura not null default 'pendente',
  periodo_atual_fim date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index assinaturas_personal_idx on public.assinaturas (personal_id, criado_em desc);
create index assinaturas_status_idx on public.assinaturas (status);

create table public.asaas_webhook_eventos (
  id text primary key,
  tipo text not null,
  payload jsonb not null,
  recebido_em timestamptz not null default now(),
  processado_em timestamptz
);

create table public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references public.personais(id) on delete cascade,
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  nota integer not null check (nota between 1 and 5),
  comentario text check (comentario is null or char_length(comentario) <= 2000),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (personal_id, aluno_id),
  check (personal_id <> aluno_id)
);

create index avaliacoes_personal_idx on public.avaliacoes (personal_id, criado_em desc);

create table public.favoritos (
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  personal_id uuid not null references public.personais(id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (aluno_id, personal_id),
  check (aluno_id <> personal_id)
);

create table public.contatos (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references public.personais(id) on delete cascade,
  aluno_id uuid references public.profiles(id) on delete set null,
  canal text not null default 'whatsapp' check (canal in ('whatsapp', 'telefone')),
  origem text,
  criado_em timestamptz not null default now()
);

create index contatos_personal_idx on public.contatos (personal_id, criado_em desc);

insert into public.modalidades (nome, categoria) values
  ('Musculação', 'Força'),
  ('Crossfit', 'Funcional'),
  ('Hyrox', 'Funcional'),
  ('Funcional', 'Funcional'),
  ('Boxe', 'Luta'),
  ('Muay Thai', 'Luta'),
  ('Jiu-Jitsu', 'Luta'),
  ('Natação', 'Água'),
  ('Corrida', 'Endurance'),
  ('Ciclismo', 'Endurance'),
  ('Tênis', 'Esporte de raquete'),
  ('Pilates', 'Mobilidade'),
  ('Futebol (preparação física)', 'Esporte coletivo');

insert into public.planos (tipo, nome, preco_mensal, beneficios) values
  ('gratuito', 'Gratuito', 0, '["Perfil básico", "Aparece na busca"]'),
  ('profissional', 'Profissional', 29.90, '["Destaque visual", "Mais fotos e vídeo", "Estatísticas de visualização"]'),
  ('premium', 'Premium', 59.90, '["Tudo do Profissional", "Destaque visual máximo", "Painel de leads", "Selo de verificado"]');

create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger profiles_set_atualizado_em
  before update on public.profiles
  for each row execute function public.set_atualizado_em();
create trigger personais_set_atualizado_em
  before update on public.personais
  for each row execute function public.set_atualizado_em();
create trigger assinaturas_set_atualizado_em
  before update on public.assinaturas
  for each row execute function public.set_atualizado_em();
create trigger avaliacoes_set_atualizado_em
  before update on public.avaliacoes
  for each row execute function public.set_atualizado_em();

-- O cliente não pode trocar o próprio papel nem promover-se a admin.
create or replace function public.proteger_role_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role is distinct from new.role
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'O papel do usuário não pode ser alterado pelo cliente.';
  end if;
  return new;
end;
$$;

create trigger profiles_proteger_role
  before update on public.profiles
  for each row execute function public.proteger_role_profile();

-- Campos derivados do personal só podem ser alterados por rotinas confiáveis.
create or replace function public.proteger_campos_derivados_personal()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if pg_trigger_depth() = 1
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    new.perfil_publico := old.perfil_publico;
    new.nota_media := old.nota_media;
    new.total_avaliacoes := old.total_avaliacoes;
  end if;
  return new;
end;
$$;

create trigger personais_proteger_campos_derivados
  before update on public.personais
  for each row execute function public.proteger_campos_derivados_personal();

-- Cria o perfil base assim que o usuário é criado no Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  novo_role public.user_role;
  novo_nome text;
begin
  novo_role := case
    when new.raw_user_meta_data ->> 'role' = 'personal' then 'personal'::public.user_role
    else 'aluno'::public.user_role
  end;

  novo_nome := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
    split_part(coalesce(new.email, 'Usuário'), '@', 1)
  );

  insert into public.profiles (id, role, nome, telefone)
  values (new.id, novo_role, novo_nome, nullif(trim(new.raw_user_meta_data ->> 'telefone'), ''));

  if novo_role = 'personal' then
    insert into public.personais (id) values (new.id);
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.atualizar_nota_media()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  alvo uuid;
begin
  alvo := coalesce(new.personal_id, old.personal_id);

  update public.personais
  set nota_media = (
        select round(coalesce(avg(a.nota), 0)::numeric, 1)
        from public.avaliacoes a
        where a.personal_id = alvo
      ),
      total_avaliacoes = (
        select count(*)::integer
        from public.avaliacoes a
        where a.personal_id = alvo
      )
  where id = alvo;

  return coalesce(new, old);
end;
$$;

create trigger avaliacoes_atualizar_nota
  after insert or update or delete on public.avaliacoes
  for each row execute function public.atualizar_nota_media();

-- Publicação deriva de pelo menos uma assinatura ativa e vigente.
create or replace function public.sincronizar_perfil_publico()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  alvo uuid;
begin
  alvo := coalesce(new.personal_id, old.personal_id);

  update public.personais p
  set perfil_publico = exists (
    select 1
    from public.assinaturas a
    where a.personal_id = alvo
      and a.status = 'ativa'::public.status_assinatura
      and (a.periodo_atual_fim is null or a.periodo_atual_fim >= current_date)
  )
  where p.id = alvo;

  return coalesce(new, old);
end;
$$;

create trigger assinaturas_sincronizar_perfil
  after insert or update or delete on public.assinaturas
  for each row execute function public.sincronizar_perfil_publico();

create or replace function public.buscar_personais(
  lat double precision,
  lng double precision,
  raio_km integer default 15,
  modalidade_id_filtro uuid default null,
  preco_max numeric default null,
  atendimento_filtro public.modalidade_local default null
)
returns table (
  personal_id uuid,
  nome text,
  avatar_url text,
  bio text,
  modalidades text[],
  preco_exibido numeric,
  nota_media numeric,
  total_avaliacoes integer,
  atendimento public.modalidade_local,
  distancia_km double precision
)
language sql
stable
as $$
  select
    p.id,
    pr.nome,
    pr.avatar_url,
    p.bio,
    coalesce((
      select array_agg(m.nome order by m.nome)
      from public.personal_modalidades pm_lista
      join public.modalidades m on m.id = pm_lista.modalidade_id
      where pm_lista.personal_id = p.id and m.ativo
    ), '{}'::text[]) as modalidades,
    case
      when modalidade_id_filtro is null then p.preco_mensal_base
      else coalesce((
        select pm_preco.preco_especifico
        from public.personal_modalidades pm_preco
        where pm_preco.personal_id = p.id
          and pm_preco.modalidade_id = modalidade_id_filtro
      ), p.preco_mensal_base)
    end as preco_exibido,
    p.nota_media,
    p.total_avaliacoes,
    p.atendimento,
    case
      when p.localizacao is null then null
      else round((st_distance(
        p.localizacao,
        st_setsrid(st_makepoint(lng, lat), 4326)::geography
      ) / 1000)::numeric, 1)::double precision
    end as distancia_km
  from public.personais p
  join public.profiles pr on pr.id = p.id
  where p.perfil_publico
    and (
      modalidade_id_filtro is null
      or exists (
        select 1
        from public.personal_modalidades pm_filtro
        where pm_filtro.personal_id = p.id
          and pm_filtro.modalidade_id = modalidade_id_filtro
      )
    )
    and (
      preco_max is null
      or case
        when modalidade_id_filtro is null then p.preco_mensal_base
        else coalesce((
          select pm_preco.preco_especifico
          from public.personal_modalidades pm_preco
          where pm_preco.personal_id = p.id
            and pm_preco.modalidade_id = modalidade_id_filtro
        ), p.preco_mensal_base)
      end <= preco_max
    )
    and (
      atendimento_filtro is null
      or p.atendimento = atendimento_filtro
      or p.atendimento = 'ambos'::public.modalidade_local
    )
    and (
      p.atendimento = 'online'::public.modalidade_local
      or atendimento_filtro = 'online'::public.modalidade_local
      or (
        p.localizacao is not null
        and st_dwithin(
          p.localizacao,
          st_setsrid(st_makepoint(lng, lat), 4326)::geography,
          raio_km * 1000
        )
      )
    )
  order by distancia_km asc nulls last, p.nota_media desc;
$$;

grant execute on function public.buscar_personais(
  double precision, double precision, integer, uuid, numeric, public.modalidade_local
) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.modalidades enable row level security;
alter table public.personais enable row level security;
alter table public.personal_modalidades enable row level security;
alter table public.personal_fotos enable row level security;
alter table public.planos enable row level security;
alter table public.assinaturas enable row level security;
alter table public.asaas_webhook_eventos enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.favoritos enable row level security;
alter table public.contatos enable row level security;

create policy profiles_select_proprio
  on public.profiles for select
  using (auth.uid() = id);

create policy profiles_select_personal_publico
  on public.profiles for select
  using (
    role = 'personal'::public.user_role
    and exists (
      select 1 from public.personais p
      where p.id = profiles.id and p.perfil_publico
    )
  );

create policy profiles_update_proprio
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role <> 'admin'::public.user_role);

create policy modalidades_select_publico
  on public.modalidades for select using (true);

create policy planos_select_publico
  on public.planos for select using (true);

create policy personais_select_publico_ou_proprio
  on public.personais for select
  using (perfil_publico or auth.uid() = id);

create policy personais_update_proprio
  on public.personais for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy personal_modalidades_select_publico_ou_proprio
  on public.personal_modalidades for select
  using (
    auth.uid() = personal_id
    or exists (
      select 1 from public.personais p
      where p.id = personal_modalidades.personal_id and p.perfil_publico
    )
  );

create policy personal_modalidades_insert_proprio
  on public.personal_modalidades for insert
  with check (auth.uid() = personal_id);
create policy personal_modalidades_update_proprio
  on public.personal_modalidades for update
  using (auth.uid() = personal_id)
  with check (auth.uid() = personal_id);
create policy personal_modalidades_delete_proprio
  on public.personal_modalidades for delete
  using (auth.uid() = personal_id);

create policy personal_fotos_select_publico_ou_proprio
  on public.personal_fotos for select
  using (
    auth.uid() = personal_id
    or exists (
      select 1 from public.personais p
      where p.id = personal_fotos.personal_id and p.perfil_publico
    )
  );
create policy personal_fotos_insert_proprio
  on public.personal_fotos for insert
  with check (auth.uid() = personal_id);
create policy personal_fotos_update_proprio
  on public.personal_fotos for update
  using (auth.uid() = personal_id)
  with check (auth.uid() = personal_id);
create policy personal_fotos_delete_proprio
  on public.personal_fotos for delete
  using (auth.uid() = personal_id);

create policy assinaturas_select_proprio
  on public.assinaturas for select
  using (auth.uid() = personal_id);

create policy avaliacoes_select_publico
  on public.avaliacoes for select
  using (
    auth.uid() = aluno_id
    or exists (
      select 1 from public.personais p
      where p.id = avaliacoes.personal_id and p.perfil_publico
    )
  );
create policy avaliacoes_insert_aluno
  on public.avaliacoes for insert
  with check (
    auth.uid() = aluno_id
    and exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role = 'aluno'::public.user_role
    )
  );
create policy avaliacoes_update_propria
  on public.avaliacoes for update
  using (auth.uid() = aluno_id)
  with check (auth.uid() = aluno_id);
create policy avaliacoes_delete_propria
  on public.avaliacoes for delete
  using (auth.uid() = aluno_id);

create policy favoritos_select_proprio
  on public.favoritos for select using (auth.uid() = aluno_id);
create policy favoritos_insert_aluno
  on public.favoritos for insert
  with check (
    auth.uid() = aluno_id
    and exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role = 'aluno'::public.user_role
    )
  );
create policy favoritos_delete_proprio
  on public.favoritos for delete using (auth.uid() = aluno_id);

-- Sem policy de insert: Route Handler server-side registra inclusive leads anônimos.
create policy contatos_select_personal
  on public.contatos for select using (auth.uid() = personal_id);

-- asaas_webhook_eventos não possui policies: acesso exclusivo via service_role.

