-- ESJ — completar estudantes_notas com a regra real de Frequência + Exame
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
-- Corre só este ficheiro se estudantes-notas.sql já tiver corrido antes.
--
-- Regra confirmada por documentos oficiais da ESJ (Plano Analítico + Pautas
-- de Exame/Frequência reais): a Frequência = Testes 70% + Trabalhos 20% +
-- Participação 10%; < 10 exclui sem exame; ≥ 14 dispensa de exame; entre 10
-- e 13,9 o estudante é admitido ao Exame Normal e, se reprovar (< 10), vai a
-- Exame de Recorrência. Ver lib/notas-formula.ts para o cálculo completo.

alter table estudantes_notas add column if not exists trabalho2 numeric(4,1);
alter table estudantes_notas add column if not exists participacao numeric(4,1);
alter table estudantes_notas add column if not exists exame_recorrencia numeric(4,1);
