-- ESJ — renumera as 20 candidaturas de teste (ESJ-2026-TESTE01...) para o
-- novo formato sequencial ESJ-EA{ano}{sequência}, mesmo que já corram
-- protocolo-candidatura-sequencial.sql e candidatura-pauta-numeracao.sql
-- antes deste (por esta ordem).
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
--
-- Torna a ligação candidatura → pauta/turma resistente a esta renumeração
-- (ON UPDATE CASCADE), para o caso de já ter lançado algum resultado ou
-- criado alguma conta de teste antes de correr isto — o link não se perde.

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

with renumeradas as (
  select protocolo as antigo,
         'ESJ-EA2026' || lpad((row_number() over (order by created_at))::text, 2, '0') as novo
  from inscricoes
  where protocolo like 'ESJ-2026-TESTE%'
)
update inscricoes i
set protocolo = r.novo
from renumeradas r
where i.protocolo = r.antigo;

-- Continua a contagem real a partir daqui, para a próxima candidatura
-- verdadeira não colidir com os números que acabaram de ser usados nas de teste.
insert into protocolo_candidatura_seq (ano_lectivo, proximo)
values ('2026', (select count(*) + 1 from inscricoes where protocolo like 'ESJ-EA2026%'))
on conflict (ano_lectivo) do update
  set proximo = greatest(protocolo_candidatura_seq.proximo, excluded.proximo);
