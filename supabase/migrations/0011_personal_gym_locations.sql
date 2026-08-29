create table public.academias_personais (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references public.personais(id) on delete cascade,
  nome text not null
    check (char_length(nome) between 2 and 120 and nome !~ '[[:cntrl:]<>]'),
  endereco text not null
    check (char_length(endereco) between 5 and 180 and endereco !~ '[[:cntrl:]<>]'),
  bairro text not null
    check (char_length(bairro) between 2 and 80 and bairro !~ '[[:cntrl:]<>]'),
  cidade text not null default 'Guarapuava'
    check (cidade = 'Guarapuava'),
  estado text not null default 'PR'
    check (estado = 'PR'),
  maps_url text
    check (
      maps_url is null
      or (
        char_length(maps_url) <= 500
        and maps_url ~* '^https://(www\.)?(google\.[a-z.]+/maps|maps\.google\.[a-z.]+/|maps\.app\.goo\.gl/)'
        and maps_url !~ '[[:cntrl:]<>]'
      )
    ),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index academias_personais_personal_idx
  on public.academias_personais (personal_id, criado_em);

create index academias_personais_bairro_idx
  on public.academias_personais (lower(bairro));

create unique index academias_personais_local_unico_idx
  on public.academias_personais (personal_id, lower(nome), lower(endereco));

create trigger academias_personais_set_atualizado_em
  before update on public.academias_personais
  for each row execute function public.set_atualizado_em();

create or replace function public.limitar_academias_por_personal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.personal_id::text, 0)
  );

  if (
    select count(*)
    from public.academias_personais a
    where a.personal_id = new.personal_id
  ) >= 20 then
    raise exception 'Não foi possível adicionar este local.' using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.limitar_academias_por_personal() from public;

create trigger academias_personais_limite
  before insert on public.academias_personais
  for each row execute function public.limitar_academias_por_personal();

alter table public.academias_personais enable row level security;

grant select on public.academias_personais to anon, authenticated;
grant insert, update, delete on public.academias_personais to authenticated;

create policy academias_personais_select_publico_ou_proprio
  on public.academias_personais for select
  using (
    auth.uid() = personal_id
    or exists (
      select 1
      from public.personais p
      where p.id = academias_personais.personal_id
        and p.perfil_publico
    )
  );

create policy academias_personais_insert_personal
  on public.academias_personais for insert
  with check (
    auth.uid() = personal_id
    and exists (
      select 1
      from public.profiles pr
      where pr.id = auth.uid()
        and pr.role = 'personal'::public.user_role
    )
  );

create policy academias_personais_update_personal
  on public.academias_personais for update
  using (auth.uid() = personal_id)
  with check (
    auth.uid() = personal_id
    and exists (
      select 1
      from public.profiles pr
      where pr.id = auth.uid()
        and pr.role = 'personal'::public.user_role
    )
  );

create policy academias_personais_delete_personal
  on public.academias_personais for delete
  using (
    auth.uid() = personal_id
    and exists (
      select 1
      from public.profiles pr
      where pr.id = auth.uid()
        and pr.role = 'personal'::public.user_role
    )
  );

comment on table public.academias_personais is 'Academias e locais presenciais informados por cada personal.';
