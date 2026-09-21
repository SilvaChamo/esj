-- ESJ — Colunas em falta em estudantes_notas (pauta pública em /pautas)
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
-- Corre só este ficheiro se estudantes-notas.sql já estiver instalado.
--
-- lib/notas.ts já espera estas colunas (regime para o filtro Diurno/
-- Pós-laboral, publicado para decidir o que aparece em /pautas, trabalho2/
-- participacao/exame_recorrencia para o cálculo da Nota de Frequência), mas
-- a tabela real nunca as teve — a pauta pública falhava silenciosamente
-- (erro de coluna inexistente, engolido pelo catch de "tabela em falta").
--
-- Sem passo de aprovação: a nota fica publicada assim que o docente a
-- lança (ver publicado: true em /api/docencia-notas).

alter table estudantes_notas
  add column if not exists regime text not null default 'diurno' check (regime in ('diurno', 'pos-laboral')),
  add column if not exists trabalho2 numeric(4,1),
  add column if not exists participacao numeric(4,1),
  add column if not exists exame_recorrencia numeric(4,1),
  add column if not exists publicado boolean not null default true;

create index if not exists estudantes_notas_publicado_idx
  on estudantes_notas (curso, cadeira_codigo, regime, publicado);

-- Leitura pública (sem sessão) só quando publicado=true — a policy
-- "estudantes_notas_read" já existente cobre "authenticated" (docente,
-- estudante, secretaria veem tudo); esta cobre visitantes sem sessão, que é
-- quem realmente acede a /pautas.
drop policy if exists "estudantes_notas_public_read" on estudantes_notas;
create policy "estudantes_notas_public_read"
  on estudantes_notas for select using (publicado = true);
