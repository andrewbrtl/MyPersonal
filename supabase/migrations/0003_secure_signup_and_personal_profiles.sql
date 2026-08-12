-- Cadastro seguro e perfil profissional completo.

alter table public.personais
  add column if not exists cref text,
  add column if not exists bairro text,
  add column if not exists horarios text[] not null default '{}';

alter table public.personais
  add constraint personais_cref_formato_check
    check (cref is null or cref ~ '^\d{4,8}-[A-Z]/[A-Z]{2}$'),
  add constraint personais_bairro_tamanho_check
    check (bairro is null or char_length(trim(bairro)) between 2 and 80);

create unique index if not exists personais_cref_unico_idx
  on public.personais (upper(cref))
  where cref is not null;

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

  if novo_role = 'personal' and novo_cref is null then
    raise exception 'CREF obrigatório para contas profissionais.';
  end if;

  insert into public.profiles (id, role, nome, telefone)
  values (new.id, novo_role, novo_nome, nullif(trim(new.raw_user_meta_data ->> 'telefone'), ''));

  if novo_role = 'personal' then
    insert into public.personais (id, cref) values (new.id, novo_cref);
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy profile_images_select_publico
  on storage.objects for select
  using (bucket_id = 'profile-images');

create policy profile_images_insert_proprio
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy profile_images_update_proprio
  on storage.objects for update to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy profile_images_delete_proprio
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
