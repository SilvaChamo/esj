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

-- Sem seed de demonstração: a pauta só se preenche a partir de candidaturas
-- reais, lançadas em Candidaturas → "Lançar resultado" (ver
-- candidatura-pauta-numeracao.sql). Este ficheiro criava sempre, na
-- primeira instalação, um lote de "estudantes" inventados sem nenhuma
-- candidatura por trás — apareciam como reais na pauta pública e na pauta
-- do painel. Removido de propósito.
