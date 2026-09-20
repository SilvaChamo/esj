-- ESJ — número de candidatura sequencial (ESJ-EA{ano}{sequência})
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
--
-- Antes, o protocolo de cada candidatura era um número aleatório gerado no
-- browser (ex.: ESJ-2026-483920). Passa a ser sequencial por ano lectivo
-- (ex.: ESJ-EA202601, ESJ-EA202602, ...), gerado sempre no servidor através
-- da função abaixo — nunca no browser, para duas pessoas a candidatar-se ao
-- mesmo tempo nunca ficarem com o mesmo número (a função faz o incremento
-- dentro de um único UPDATE, que o Postgres serializa automaticamente).

create table if not exists protocolo_candidatura_seq (
  ano_lectivo text primary key,
  proximo int not null default 1
);

alter table protocolo_candidatura_seq enable row level security;
-- Sem políticas para anon/authenticated: só a função abaixo (security
-- definer) lhe mexe — ninguém consegue ler/escrever o contador directamente.

create or replace function proximo_protocolo(ano text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq int;
begin
  insert into protocolo_candidatura_seq (ano_lectivo, proximo)
  values (ano, 2)
  on conflict (ano_lectivo) do update set proximo = protocolo_candidatura_seq.proximo + 1
  returning proximo - 1 into seq;
  return 'ESJ-EA' || ano || lpad(seq::text, 2, '0');
end;
$$;

-- O formulário público de candidatura (sem sessão iniciada) precisa de
-- chamar esta função para obter o número antes de gravar a candidatura.
grant execute on function proximo_protocolo(text) to anon, authenticated;
