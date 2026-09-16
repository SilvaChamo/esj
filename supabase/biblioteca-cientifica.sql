-- ESJ — Biblioteca científica (colar uma vez no SQL Editor e Run)
-- https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new

create table if not exists biblioteca_cientifica (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  curso text not null check (curso in ('JJ', 'PM', 'RP', 'BD')),
  tipo text not null check (
    tipo in ('monografia', 'projecto-experimental', 'relatorio-estagio', 'artigo')
  ),
  ramos text not null default '',
  tutor text not null default '',
  avaliador text not null default '',
  numero_estudante text not null default '',
  ano int not null,
  autores text[] not null default '{}',
  resumo text not null default '',
  ficheiro text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Se a tabela já existia sem estes campos:
alter table biblioteca_cientifica add column if not exists avaliador text not null default '';
alter table biblioteca_cientifica add column if not exists numero_estudante text not null default '';

create index if not exists biblioteca_cientifica_curso_idx on biblioteca_cientifica (curso);
create index if not exists biblioteca_cientifica_tipo_idx on biblioteca_cientifica (tipo);
create index if not exists biblioteca_cientifica_ano_idx on biblioteca_cientifica (ano desc);

alter table biblioteca_cientifica enable row level security;

drop policy if exists "biblioteca_cientifica_public_read" on biblioteca_cientifica;
drop policy if exists "biblioteca_cientifica_auth_write" on biblioteca_cientifica;

create policy "biblioteca_cientifica_public_read"
  on biblioteca_cientifica for select using (true);

create policy "biblioteca_cientifica_auth_write"
  on biblioteca_cientifica for all to authenticated using (true) with check (true);
