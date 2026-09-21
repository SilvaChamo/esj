-- ESJ — renumera TODAS as candidaturas de 2026 já gravadas com o formato
-- antigo de 2 dígitos (ESJ-CA202601, ESJ-CA202602, ...) para o formato
-- correcto de 3 dígitos (ESJ-CA2026001, ESJ-CA2026002, ...).
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
--
-- Porquê: a função proximo_protocolo() já foi corrigida para gerar 3
-- dígitos (ver protocolo-candidatura-sequencial.sql), mas isso só afecta
-- candidaturas novas — o protocolo de cada candidatura já existente foi
-- gravado uma única vez, no momento da inscrição, e nunca é recalculado.
-- As candidaturas já recebidas continuam a mostrar "51" etc. na lista de
-- Candidaturas até serem explicitamente renumeradas aqui.
--
-- Seguro para colar duas vezes: a segunda vez não muda nada. Não mexe
-- noutros anos lectivos.

-- 1) Garante que a ligação candidatura → pauta/turma sobrevive à
--    renumeração (ON UPDATE CASCADE), mesmo que este passo já tenha sido
--    feito antes por renumerar-candidaturas-teste.sql.
alter table pauta_admissao
  drop constraint if exists pauta_admissao_candidatura_protocolo_fkey,
  add constraint pauta_admissao_candidatura_protocolo_fkey
    foreign key (candidatura_protocolo) references inscricoes(protocolo)
    on delete set null on update cascade;

alter table turma_estudantes
  drop constraint if exists turma_estudantes_candidatura_protocolo_fkey,
  add constraint turma_estudantes_candidatura_protocolo_fkey
    foreign key (candidatura_protocolo) references inscricoes(protocolo)
    on delete set null on update cascade;

-- 2) Renumera por ordem de chegada (created_at), formato ESJ-CA2026 + 3
--    dígitos. Os valores antigos têm sempre 2 dígitos (12 caracteres) e os
--    novos têm sempre 3 (13 caracteres), por isso nunca podem colidir entre
--    si dentro do mesmo UPDATE.
with renumeradas as (
  select protocolo as antigo,
         'ESJ-CA2026' || lpad((row_number() over (order by created_at))::text, 3, '0') as novo
  from inscricoes
  where protocolo like 'ESJ-CA2026%'
    and ano_lectivo = '2026'
)
update inscricoes i
set protocolo = r.novo
from renumeradas r
where i.protocolo = r.antigo
  and i.protocolo <> r.novo;

-- 3) Repõe o contador a partir do maior número de 3 dígitos realmente em
--    uso (não uma simples contagem de linhas — evita a dessincronização
--    que causou o "51" a ficar preso da primeira vez).
insert into protocolo_candidatura_seq (ano_lectivo, proximo)
select '2026', coalesce(max(substring(protocolo from 11)::int), 0) + 1
from inscricoes
where protocolo ~ '^ESJ-CA2026[0-9]{3}$'
on conflict (ano_lectivo) do update
  set proximo = greatest(protocolo_candidatura_seq.proximo, excluded.proximo);

-- 4) Reconfirma a função com o lpad de 3 dígitos e o grant, para o caso de
--    a correcção anterior não ter chegado a ser colada no Supabase.
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
  return 'ESJ-CA' || ano || lpad(seq::text, 3, '0');
end;
$$;

grant execute on function proximo_protocolo(text) to anon, authenticated;
