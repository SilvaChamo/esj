-- ESJ — Notas dos Estudantes por Cadeira (colar uma vez no SQL Editor e Run)
-- https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new

create table if not exists estudantes_notas (
  id uuid primary key default gen_random_uuid(),
  estudante_id uuid not null references auth.users(id) on delete cascade,
  numero_estudante text not null,
  nome_estudante text not null,
  curso text not null check (
    curso in ('jornalismo', 'publicidade-e-marketing', 'relacoes-publicas', 'biblioteconomia-e-documentacao')
  ),
  cadeira_codigo text not null,
  cadeira_nome text not null,
  regime text not null default 'diurno',
  ano int not null,
  semestre int not null,
  teste1 numeric(4,1),
  teste2 numeric(4,1),
  trabalho numeric(4,1),
  trabalho2 numeric(4,1),
  participacao numeric(4,1),
  exame_normal numeric(4,1),
  exame_recorrencia numeric(4,1),
  media_final numeric(4,1),
  resultado text not null default 'Em Frequência' check (
    resultado in ('Aprovado', 'Em Frequência', 'Reprovado', 'Excluído')
  ),
  docente_id uuid references auth.users(id),
  docente_nome text,
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (estudante_id, curso, cadeira_codigo)
);

create index if not exists estudantes_notas_estudante_idx on estudantes_notas (estudante_id);
create index if not exists estudantes_notas_cadeira_idx on estudantes_notas (curso, cadeira_codigo);
create index if not exists estudantes_notas_turma_idx
  on estudantes_notas (curso, regime, cadeira_codigo, publicado);

-- Leitura: qualquer conta autenticada vê tudo (o próprio estudante precisa
-- de ver a sua nota em tempo real, antes de a pauta da turma ser publicada).
-- Um visitante sem sessão só vê cadeiras já publicadas pelo registo
-- académico (publicado = true) — pauta final pública em /pautas, tal como a
-- pauta de admissão (pauta_admissao). A escrita passa sempre por rota de
-- servidor: /api/docencia-notas (lançar nota, exige docente com a cadeira
-- atribuída ou super-admin) e /api/pautas-publicar (publicar/despublicar,
-- exige super-admin) — por isso não há políticas de escrita para
-- utilizadores autenticados comuns.
alter table estudantes_notas enable row level security;

drop policy if exists "estudantes_notas_read" on estudantes_notas;
drop policy if exists "estudantes_notas_public_publicado" on estudantes_notas;

create policy "estudantes_notas_read"
  on estudantes_notas for select to authenticated using (true);

create policy "estudantes_notas_public_publicado"
  on estudantes_notas for select using (publicado = true);
