-- ESJ — candidatura por ano lectivo (Candidatura 2026, 2027, ...)
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
-- Corre depois de candidatura-pauta-numeracao.sql.
--
-- Cada candidatura passa a levar o ano lectivo em que entrou (ex.: 2026),
-- para a lista de Candidaturas poder separar o ciclo actual dos anteriores
-- num selector junto ao título, sem apagar nada. E a numeração de
-- estudantes passa a ter o seu próprio contador por ano lectivo
-- (curso + regime + ano) — assim, ao virar de ano, o número inicial de
-- cada curso/regime começa limpo, sem se misturar com a sequência do ano
-- anterior.

alter table inscricoes
  add column if not exists ano_lectivo text not null default '2026';

create index if not exists inscricoes_ano_lectivo_idx on inscricoes (ano_lectivo);

alter table numeracao_estudantes
  add column if not exists ano_lectivo text not null default '2026';

alter table numeracao_estudantes drop constraint if exists numeracao_estudantes_pkey;
alter table numeracao_estudantes add primary key (curso, regime, ano_lectivo);
