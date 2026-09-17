-- ESJ — Docência (colar uma vez no SQL Editor e Run)
-- https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new

create table if not exists docencia_materiais (
  id uuid primary key default gen_random_uuid(),
  curso text not null check (
    curso in ('jornalismo', 'publicidade-e-marketing', 'relacoes-publicas', 'biblioteconomia-e-documentacao')
  ),
  cadeira text not null,
  cadeira_slug text not null,
  tipo text not null check (tipo in ('pauta', 'livro', 'outro')),
  titulo text not null,
  ficheiro text not null,
  autor text,
  autor_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists docencia_materiais_curso_idx on docencia_materiais (curso);
create index if not exists docencia_materiais_cadeira_idx on docencia_materiais (curso, cadeira_slug);

-- Acesso restrito: só contas autenticadas (docentes/admin) leem e escrevem.
-- A página pública /docencia exige sessão iniciada (ver middleware.ts).
alter table docencia_materiais enable row level security;

drop policy if exists "docencia_materiais_auth_all" on docencia_materiais;

create policy "docencia_materiais_auth_all"
  on docencia_materiais for all to authenticated using (true) with check (true);
