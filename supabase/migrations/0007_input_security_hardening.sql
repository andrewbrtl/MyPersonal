-- Validação em profundidade para todos os dados preenchidos por usuários.
-- A aplicação valida primeiro; estas regras protegem também acessos diretos à API.

create or replace function public.texto_plano_seguro(valor text, permitir_quebras boolean default false)
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select
    valor !~ '[<>]'
    and case
      when permitir_quebras then regexp_replace(valor, E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]'
      else valor !~ '[[:cntrl:]]'
    end;
$$;

create or replace function public.url_https_segura(valor text, hosts_permitidos text[] default null)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  hostname text;
begin
  if char_length(valor) > 300
     or valor !~ '^https://'
     or valor ~ '[[:space:][:cntrl:]<>]'
     or valor ~ '^https://[^/?#]*@'
     or position('#' in valor) > 0 then
    return false;
  end if;

  hostname := lower(substring(valor from '^https://([^/?#:]+)'));
  if hostname is null
     or hostname not like '%.%'
     or hostname ~ '^[0-9.]+$'
     or lower(hostname) = 'localhost'
     or substring(valor from '^https://[^/?#]+') ~ ':[0-9]+$' then
    return false;
  end if;

  if hosts_permitidos is null then
    return true;
  end if;

  return exists (
    select 1
    from unnest(hosts_permitidos) as permitido(host)
    where hostname = lower(permitido.host)
       or right(hostname, char_length(permitido.host) + 1) = '.' || lower(permitido.host)
  );
end;
$$;

create or replace function public.horarios_seguros(valores text[])
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select cardinality(valores) <= 14
    and not exists (
      select 1
      from unnest(valores) as horario
      where char_length(trim(horario)) not between 1 and 100
         or horario is distinct from trim(horario)
         or not public.texto_plano_seguro(horario, false)
    );
$$;

revoke all on function public.texto_plano_seguro(text, boolean) from public;
revoke all on function public.url_https_segura(text, text[]) from public;
revoke all on function public.horarios_seguros(text[]) from public;
grant execute on function public.texto_plano_seguro(text, boolean) to anon, authenticated, service_role;
grant execute on function public.url_https_segura(text, text[]) to anon, authenticated, service_role;
grant execute on function public.horarios_seguros(text[]) to anon, authenticated, service_role;

alter table public.profiles
  add constraint profiles_nome_seguro_check
    check (public.texto_plano_seguro(nome, false)),
  add constraint profiles_cidade_segura_check
    check (char_length(trim(cidade)) between 2 and 80 and public.texto_plano_seguro(cidade, false)),
  add constraint profiles_estado_formato_check
    check (estado ~ '^[A-Z]{2}$'),
  add constraint profiles_avatar_confiavel_check
    check (
      avatar_url is null
      or (
        char_length(avatar_url) <= 500
        and avatar_url like 'https://ktxuegrouetaboombiuv.supabase.co/storage/v1/object/public/profile-images/' || id::text || '/avatar-%'
        and avatar_url ~ '\.(jpg|png|webp)$'
      )
    );

alter table public.personais
  add constraint personais_bio_segura_check
    check (bio is null or (char_length(trim(bio)) between 40 and 1200 and public.texto_plano_seguro(bio, true))),
  add constraint personais_formacao_segura_check
    check (formacao is null or (char_length(trim(formacao)) between 5 and 500 and public.texto_plano_seguro(formacao, true))),
  add constraint personais_bairro_seguro_check
    check (bairro is null or public.texto_plano_seguro(bairro, false)),
  add constraint personais_preco_limite_check
    check (preco_mensal_base is null or preco_mensal_base <= 100000),
  add constraint personais_horarios_seguros_check
    check (public.horarios_seguros(horarios)),
  add constraint personais_whatsapp_formato_check
    check (whatsapp is null or whatsapp ~ '^\d{10,11}$'),
  add constraint personais_instagram_url_segura_check
    check (instagram_url is null or public.url_https_segura(instagram_url, array['instagram.com'])),
  add constraint personais_facebook_url_segura_check
    check (facebook_url is null or public.url_https_segura(facebook_url, array['facebook.com', 'fb.com'])),
  add constraint personais_tiktok_url_segura_check
    check (tiktok_url is null or public.url_https_segura(tiktok_url, array['tiktok.com'])),
  add constraint personais_youtube_url_segura_check
    check (youtube_url is null or public.url_https_segura(youtube_url, array['youtube.com', 'youtu.be'])),
  add constraint personais_website_url_segura_check
    check (website_url is null or public.url_https_segura(website_url, null)),
  add constraint personais_video_url_segura_check
    check (video_apresentacao_url is null or public.url_https_segura(video_apresentacao_url, null));

alter table public.personal_modalidades
  add constraint personal_modalidades_preco_limite_check
    check (preco_especifico is null or preco_especifico <= 100000);

alter table public.personal_fotos
  add constraint personal_fotos_storage_path_seguro_check
    check (char_length(storage_path) between 1 and 500 and public.texto_plano_seguro(storage_path, false)),
  add constraint personal_fotos_texto_alternativo_seguro_check
    check (texto_alternativo is null or (char_length(texto_alternativo) <= 200 and public.texto_plano_seguro(texto_alternativo, false))),
  add constraint personal_fotos_ordem_limite_check
    check (ordem <= 100);

alter table public.avaliacoes
  add constraint avaliacoes_comentario_seguro_check
    check (
      comentario is null
      or (char_length(trim(comentario)) between 1 and 2000 and public.texto_plano_seguro(comentario, true))
    );

alter table public.contatos
  add constraint contatos_origem_segura_check
    check (origem is null or origem in ('perfil_publico', 'busca'));

-- Operação atômica: nenhum perfil fica salvo pela metade e nenhum filtro SQL é montado como texto.
create or replace function public.salvar_perfil_profissional(
  perfil_id uuid,
  novo_nome text,
  novo_telefone text,
  novo_cref text,
  novo_bairro text,
  nova_bio text,
  nova_formacao text,
  novos_anos_experiencia integer,
  novo_preco numeric,
  novo_atendimento public.modalidade_local,
  novos_horarios text[],
  novas_modalidades uuid[],
  novo_whatsapp text,
  novo_instagram_url text,
  novo_facebook_url text,
  novo_tiktok_url text,
  novo_youtube_url text,
  novo_website_url text,
  alterar_avatar boolean,
  nova_avatar_url text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  quantidade_modalidades integer;
begin
  if novas_modalidades is null or cardinality(novas_modalidades) not between 1 and 20 then
    raise exception 'Lista de modalidades inválida.' using errcode = '22023';
  end if;

  select count(distinct selecionada.id)
  into quantidade_modalidades
  from unnest(novas_modalidades) as selecionada(id);

  if quantidade_modalidades <> cardinality(novas_modalidades)
     or exists (
       select 1
       from unnest(novas_modalidades) as selecionada(id)
       left join public.modalidades m on m.id = selecionada.id and m.ativo
       where m.id is null
     ) then
    raise exception 'Lista de modalidades inválida.' using errcode = '22023';
  end if;

  update public.profiles
  set nome = novo_nome,
      telefone = novo_telefone,
      avatar_url = case when alterar_avatar then nova_avatar_url else avatar_url end
  where id = perfil_id and role = 'personal'::public.user_role;

  if not found then
    raise exception 'Perfil profissional não encontrado.' using errcode = 'P0002';
  end if;

  update public.personais
  set cref = novo_cref,
      bairro = novo_bairro,
      bio = nova_bio,
      formacao = nova_formacao,
      anos_experiencia = novos_anos_experiencia,
      preco_mensal_base = novo_preco,
      atendimento = novo_atendimento,
      horarios = novos_horarios,
      whatsapp = novo_whatsapp,
      instagram_url = novo_instagram_url,
      facebook_url = novo_facebook_url,
      tiktok_url = novo_tiktok_url,
      youtube_url = novo_youtube_url,
      website_url = novo_website_url
  where id = perfil_id;

  if not found then
    raise exception 'Dados profissionais não encontrados.' using errcode = 'P0002';
  end if;

  delete from public.personal_modalidades
  where personal_id = perfil_id
    and not (modalidade_id = any(novas_modalidades));

  insert into public.personal_modalidades (personal_id, modalidade_id)
  select perfil_id, modalidade_id
  from unnest(novas_modalidades) as modalidade_id
  on conflict (personal_id, modalidade_id) do nothing;

  if not exists (
    select 1 from public.assinaturas
    where personal_id = perfil_id and status = 'ativa'::public.status_assinatura
  ) then
    insert into public.assinaturas (personal_id, plano_id, status)
    select perfil_id, id, 'ativa'::public.status_assinatura
    from public.planos
    where tipo = 'gratuito'::public.tipo_plano and ativo
    limit 1;
  end if;
end;
$$;

revoke all on function public.salvar_perfil_profissional(
  uuid, text, text, text, text, text, text, integer, numeric,
  public.modalidade_local, text[], uuid[], text, text, text, text, text, text, boolean, text
) from public, anon, authenticated;

grant execute on function public.salvar_perfil_profissional(
  uuid, text, text, text, text, text, text, integer, numeric,
  public.modalidade_local, text[], uuid[], text, text, text, text, text, text, boolean, text
) to service_role;

-- A API autenticada continua protegida mesmo que alguém ignore os formulários.
drop policy if exists avaliacoes_insert_aluno on public.avaliacoes;
create policy avaliacoes_insert_aluno
  on public.avaliacoes for insert
  with check (
    auth.uid() = aluno_id
    and exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role = 'aluno'::public.user_role
    )
    and exists (
      select 1 from public.personais p
      where p.id = avaliacoes.personal_id and p.perfil_publico
    )
  );

drop policy if exists avaliacoes_update_propria on public.avaliacoes;
create policy avaliacoes_update_propria
  on public.avaliacoes for update
  using (auth.uid() = aluno_id)
  with check (
    auth.uid() = aluno_id
    and exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role = 'aluno'::public.user_role
    )
    and exists (
      select 1 from public.personais p
      where p.id = avaliacoes.personal_id and p.perfil_publico
    )
  );

drop policy if exists favoritos_insert_aluno on public.favoritos;
create policy favoritos_insert_aluno
  on public.favoritos for insert
  with check (
    auth.uid() = aluno_id
    and exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role = 'aluno'::public.user_role
    )
    and exists (
      select 1 from public.personais p
      where p.id = favoritos.personal_id and p.perfil_publico
    )
  );

-- Restringe uploads diretos ao mesmo padrão de nomes e tipos usados pelo servidor.
drop policy if exists profile_images_insert_proprio on storage.objects;
create policy profile_images_insert_proprio
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and name ~ ('^' || auth.uid()::text || '/avatar-[0-9a-f-]{36}\.(jpg|png|webp)$')
    and lower(storage.extension(name)) in ('jpg', 'png', 'webp')
    and lower(coalesce(metadata ->> 'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
  );

drop policy if exists profile_images_update_proprio on storage.objects;
create policy profile_images_update_proprio
  on storage.objects for update to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and name ~ ('^' || auth.uid()::text || '/avatar-[0-9a-f-]{36}\.(jpg|png|webp)$')
    and lower(storage.extension(name)) in ('jpg', 'png', 'webp')
    and lower(coalesce(metadata ->> 'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
  );
