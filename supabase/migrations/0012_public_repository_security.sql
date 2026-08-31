-- Defesa adicional para operação pública: limites atômicos, privilégios mínimos
-- e remoção de uma RPC antiga que não é usada pela aplicação.

create table public.limites_operacoes (
  operacao text not null
    check (operacao in ('login', 'cadastro', 'recuperacao', 'contato')),
  chave_hash text not null
    check (chave_hash ~ '^[0-9a-f]{64}$'),
  janela_inicio timestamptz not null default now(),
  quantidade integer not null default 1
    check (quantidade between 1 and 100000),
  primary key (operacao, chave_hash)
);

create index limites_operacoes_janela_idx
  on public.limites_operacoes (janela_inicio);

alter table public.limites_operacoes enable row level security;
revoke all on table public.limites_operacoes from public, anon, authenticated;
grant select, insert, update, delete on table public.limites_operacoes to service_role;

comment on table public.limites_operacoes is
  'Contadores técnicos por impressão HMAC; nenhum endereço IP é armazenado em texto puro.';

create or replace function public.consumir_limite_operacao(
  p_operacao text,
  p_chave_hash text,
  p_limite integer,
  p_janela_segundos integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  contador integer;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
     or p_operacao not in ('login', 'cadastro', 'recuperacao', 'contato')
     or p_chave_hash !~ '^[0-9a-f]{64}$'
     or p_limite not between 1 and 1000
     or p_janela_segundos not between 10 and 86400 then
    raise exception 'Operação de segurança inválida.' using errcode = '22023';
  end if;

  insert into public.limites_operacoes as limite (
    operacao,
    chave_hash,
    janela_inicio,
    quantidade
  ) values (
    p_operacao,
    p_chave_hash,
    now(),
    1
  )
  on conflict (operacao, chave_hash) do update
  set janela_inicio = case
        when limite.janela_inicio <= now() - make_interval(secs => p_janela_segundos)
          then now()
        else limite.janela_inicio
      end,
      quantidade = case
        when limite.janela_inicio <= now() - make_interval(secs => p_janela_segundos)
          then 1
        else least(limite.quantidade + 1, p_limite + 1)
      end
  returning quantidade into contador;

  delete from public.limites_operacoes
  where janela_inicio < now() - interval '2 days';

  return contador <= p_limite;
end;
$$;

revoke all on function public.consumir_limite_operacao(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consumir_limite_operacao(text, text, integer, integer)
  to service_role;

-- A busca atual usa consultas server-side com DTO público; esta RPC antiga só
-- ampliava a superfície disponível para chamadas diretas e parâmetros abusivos.
revoke execute on function public.buscar_personais(
  double precision,
  double precision,
  integer,
  uuid,
  numeric,
  public.modalidade_local
) from public, anon, authenticated;
