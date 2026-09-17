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

-- Acesso restrito: só contas autenticadas (pessoal da ESJ) leem e escrevem.
-- A página pública /docencia exige sessão iniciada (ver middleware.ts).
-- Leitura, edição e eliminação ficam partilhadas entre o pessoal (mesmo
-- critério dos álbuns/galeria); só a criação exige que o autor seja o
-- próprio utilizador, para não se poder publicar material em nome de outro.
alter table docencia_materiais enable row level security;

drop policy if exists "docencia_materiais_auth_all" on docencia_materiais;
drop policy if exists "docencia_materiais_read" on docencia_materiais;
drop policy if exists "docencia_materiais_insert" on docencia_materiais;
drop policy if exists "docencia_materiais_update" on docencia_materiais;
drop policy if exists "docencia_materiais_delete" on docencia_materiais;

create policy "docencia_materiais_read"
  on docencia_materiais for select to authenticated using (true);

create policy "docencia_materiais_insert"
  on docencia_materiais for insert to authenticated with check (autor_id = auth.uid());

create policy "docencia_materiais_update"
  on docencia_materiais for update to authenticated using (true) with check (true);

create policy "docencia_materiais_delete"
  on docencia_materiais for delete to authenticated using (true);
