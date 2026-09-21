-- Eventos editoriais ESJ (cartaz A4 → arquivo → página)
-- Correr no SQL Editor do Supabase se a tabela ainda não existir.

create table if not exists eventos_esj (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  tipo text not null check (tipo in ('conferencia', 'semana', 'coloquio')),
  titulo text not null,
  resumo text not null default '',
  descricao text not null default '',
  cartaz_url text not null,
  data_inicio date not null,
  data_fim date,
  hora text not null default '',
  local text not null default '',
  convidado text not null default '',
  oradores text not null default '',
  programa jsonb not null default '[]'::jsonb,
  galeria_urls jsonb not null default '[]'::jsonb,
  documentos jsonb not null default '[]'::jsonb,
  inscricao_url text not null default '',
  estado text not null default 'proximo' check (estado in ('proximo', 'realizado')),
  publicado boolean not null default true,
  created_by text,
  created_by_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists eventos_esj_tipo_idx on eventos_esj (tipo);
create index if not exists eventos_esj_data_idx on eventos_esj (data_inicio desc);
create index if not exists eventos_esj_estado_idx on eventos_esj (estado);

alter table eventos_esj enable row level security;

drop policy if exists "eventos_esj_public_read" on eventos_esj;
drop policy if exists "eventos_esj_auth_write" on eventos_esj;

create policy "eventos_esj_public_read"
  on eventos_esj for select using (publicado = true);

create policy "eventos_esj_auth_write"
  on eventos_esj for all to authenticated using (true) with check (true);
