-- Chaves `sb_secret_...` não são JWTs. No banco, a identificação confiável
-- da chamada privilegiada é o papel corrente definido pelo gateway.

create or replace function public.proteger_role_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role is distinct from new.role
     and current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception 'O papel do usuário não pode ser alterado pelo cliente.';
  end if;
  return new;
end;
$$;

create or replace function public.proteger_campos_derivados_personal()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if pg_trigger_depth() = 1
     and current_user not in ('service_role', 'postgres', 'supabase_admin') then
    new.perfil_publico := old.perfil_publico;
    new.nota_media := old.nota_media;
    new.total_avaliacoes := old.total_avaliacoes;
  end if;
  return new;
end;
$$;
