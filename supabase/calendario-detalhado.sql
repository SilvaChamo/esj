-- ESJ — Calendário académico detalhado partilhado (gestão ↔ estudante ↔ site)
-- Colar no SQL Editor e Run:
-- https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new

create table if not exists calendario_detalhado (
  id int primary key default 1,
  ano_lectivo text not null default '2026',
  subtitulo text not null default '',
  eventos jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table calendario_detalhado enable row level security;

drop policy if exists "calendario_detalhado_public_read" on calendario_detalhado;
drop policy if exists "calendario_detalhado_auth_write" on calendario_detalhado;

create policy "calendario_detalhado_public_read"
  on calendario_detalhado for select using (true);

create policy "calendario_detalhado_auth_write"
  on calendario_detalhado for all to authenticated using (true) with check (true);

insert into calendario_detalhado (id, ano_lectivo, subtitulo, eventos)
values (1, '2026', 'Calendário Académico Oficial da Escola Superior de Jornalismo', '[]'::jsonb)
on conflict (id) do nothing;
