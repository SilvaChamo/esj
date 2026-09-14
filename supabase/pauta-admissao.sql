-- ESJ — pauta de admissão e filtros de inscrição
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
-- Corre só este ficheiro se o schema principal já estiver instalado.

alter table inscricoes add column if not exists nivel text not null default 'Licenciatura';

create table if not exists pauta_admissao (
  id uuid primary key default gen_random_uuid(),
  ano_lectivo text not null default '2026',
  nivel text not null default 'Licenciatura',
  curso text not null,
  regime text not null,
  apelido text not null,
  nome text not null,
  nota_portugues numeric(5,2) not null,
  nota_historia numeric(5,2) not null,
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pauta_admissao_filtro_idx
  on pauta_admissao (ano_lectivo, nivel, curso, regime, publicado);

alter table pauta_admissao enable row level security;

drop policy if exists "pauta_public_read" on pauta_admissao;
drop policy if exists "pauta_auth_write" on pauta_admissao;

create policy "pauta_public_read" on pauta_admissao
  for select using (publicado = true);

create policy "pauta_auth_write" on pauta_admissao
  for all to authenticated using (true) with check (true);

insert into pauta_admissao
  (ano_lectivo, nivel, curso, regime, apelido, nome, nota_portugues, nota_historia, publicado)
select * from (values
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Bila', 'Ana Maria', 16.00, 14.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Chissano', 'Carlos Eduardo', 11.00, 9.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Dava', 'Esperança', 8.00, 9.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Francisco', 'João Pedro', 13.50, 15.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Gove', 'Lurdes', 17.00, 16.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Mabunda', 'Pedro António', 12.00, 12.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Nhaca', 'Fátima', 14.00, 13.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Sitoe', 'Miguel', 9.50, 10.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Pós-laboral', 'Alberto', 'Helena', 15.00, 14.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Pós-laboral', 'Cossa', 'Daniel', 10.00, 11.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Pós-laboral', 'Machel', 'Inês', 7.50, 8.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Pós-laboral', 'Tembe', 'Rui', 13.00, 12.50, true)
) as v(ano_lectivo, nivel, curso, regime, apelido, nome, nota_portugues, nota_historia, publicado)
where not exists (select 1 from pauta_admissao);
