-- Garante no banco que toda conta nova informe o telefone usado como login alternativo.

create or replace function public.validar_telefone_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  novo_telefone text;
begin
  novo_telefone := regexp_replace(coalesce(new.raw_user_meta_data ->> 'telefone', ''), '[^0-9]', '', 'g');

  if char_length(novo_telefone) in (12, 13) and novo_telefone like '55%' then
    novo_telefone := substring(novo_telefone from 3);
  end if;

  if novo_telefone !~ '^\d{10,11}$' then
    raise exception 'Telefone com DDD obrigatório para novas contas.';
  end if;

  return new;
end;
$$;

revoke all on function public.validar_telefone_novo_usuario() from public;

create trigger before_auth_user_require_phone
  before insert on auth.users
  for each row execute function public.validar_telefone_novo_usuario();
