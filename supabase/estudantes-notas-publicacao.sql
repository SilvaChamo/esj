-- ESJ — publicação da pauta final por cadeira (registo académico)
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
-- Corre só este ficheiro se estudantes-notas.sql já tiver corrido antes.
--
-- Regime falta na tabela (cada cadeira pertence a diurno OU pós-laboral —
-- ver a pauta real: "SALA 1 - LABORAL" / "SALA 1 - POS LABORAL" nunca
-- aparecem juntas na mesma pauta). Publicado controla se a pauta final da
-- cadeira já está visível publicamente em /pautas — o estudante continua a
-- ver a sua própria nota em tempo real no painel antes disso; só a vista
-- pública por turma (todos os estudantes da cadeira) depende de publicado.

alter table estudantes_notas add column if not exists regime text;
update estudantes_notas set regime = 'diurno' where regime is null;
alter table estudantes_notas alter column regime set default 'diurno';

alter table estudantes_notas add column if not exists publicado boolean not null default false;

create index if not exists estudantes_notas_turma_idx
  on estudantes_notas (curso, regime, cadeira_codigo, publicado);

drop policy if exists "estudantes_notas_public_publicado" on estudantes_notas;

-- Pauta final publicada = documento público, tal como a pauta de admissão
-- (pauta_admissao) — qualquer visitante pode ler, mesmo sem sessão.
create policy "estudantes_notas_public_publicado"
  on estudantes_notas for select
  using (publicado = true);
