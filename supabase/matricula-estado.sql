-- ESJ — estado da matrícula (Activo / Trancado / Desistiu)
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
-- Corre só este ficheiro se situacao-estudante.sql já estiver instalado.
--
-- Trancado: mantém o número reservado, à espera do regresso do estudante.
-- Desistiu: o número sai da turma activa mas fica arquivado — nunca é
-- reatribuído a outra pessoa (um número de estudante, uma vez comunicado a
-- alguém, nunca volta a circular — mesmo critério já usado na numeração de
-- admissão).

alter table situacao_estudante
  add column if not exists matricula_estado text not null default 'activo'
  check (matricula_estado in ('activo', 'trancado', 'desistiu'));

create index if not exists situacao_estudante_matricula_idx
  on situacao_estudante (matricula_estado);
