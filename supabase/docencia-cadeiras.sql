-- ESJ — Cadeiras atribuídas a Docentes (colar uma vez no SQL Editor e Run)
-- https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new

create table if not exists docencia_cadeiras (
  id uuid primary key default gen_random_uuid(),
  docente_id uuid not null references auth.users(id) on delete cascade,
  docente_email text,
  curso text not null check (
    curso in ('jornalismo', 'publicidade-e-marketing', 'relacoes-publicas', 'biblioteconomia-e-documentacao')
  ),
  cadeira_codigo text not null,
  cadeira_nome text not null,
  ano int,
  semestre int,
  created_at timestamptz not null default now(),
  unique (docente_id, curso, cadeira_codigo)
);

create index if not exists docencia_cadeiras_docente_idx on docencia_cadeiras (docente_id);
create index if not exists docencia_cadeiras_cadeira_idx on docencia_cadeiras (curso, cadeira_codigo);

-- Acesso: cada docente só lê as suas próprias atribuições. A atribuição em
-- si (criar/editar/remover) é feita pela Gestão através da rota
-- /api/docencia-cadeiras, que usa a chave de serviço e exige super-admin
-- (mesmo critério das contas de docente) — por isso não há políticas de
-- escrita para utilizadores autenticados comuns.
alter table docencia_cadeiras enable row level security;

drop policy if exists "docencia_cadeiras_read_own" on docencia_cadeiras;

create policy "docencia_cadeiras_read_own"
  on docencia_cadeiras for select to authenticated using (docente_id = auth.uid());
