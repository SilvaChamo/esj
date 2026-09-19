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
  ano int not null,
  semestre int not null,
  teste1 numeric(4,1),
  teste2 numeric(4,1),
  trabalho numeric(4,1),
  exame_normal numeric(4,1),
  media_final numeric(4,1),
  resultado text not null default 'Em Frequência' check (
    resultado in ('Aprovado', 'Em Frequência', 'Reprovado', 'Excluído')
  ),
  docente_id uuid references auth.users(id),
  docente_nome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (estudante_id, curso, cadeira_codigo)
);

create index if not exists estudantes_notas_estudante_idx on estudantes_notas (estudante_id);
create index if not exists estudantes_notas_cadeira_idx on estudantes_notas (curso, cadeira_codigo);

-- Leitura: uma pauta é, por natureza, um documento público afixado para toda
-- a turma (tal como docencia_materiais) — qualquer conta autenticada pode
-- ler, incluindo colegas de turma pelo nome. A escrita (lançar/editar nota)
-- passa sempre pela rota /api/docencia-notas, que confirma que quem chama é
-- super-admin OU um docente com a cadeira atribuída em docencia_cadeiras —
-- por isso não há políticas de escrita para utilizadores autenticados comuns.
alter table estudantes_notas enable row level security;

drop policy if exists "estudantes_notas_read" on estudantes_notas;

create policy "estudantes_notas_read"
  on estudantes_notas for select to authenticated using (true);
