-- ESJ — situação do estudante (confirmação manual da secretaria)
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
-- Corre só este ficheiro se o schema principal já estiver instalado.

create table if not exists situacao_estudante (
  id uuid primary key default gen_random_uuid(),
  numero_estudante text not null unique,
  nome text not null,
  curso text,
  regime text,
  regularizado boolean not null default false,
  observacao text,
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists situacao_estudante_numero_idx
  on situacao_estudante (numero_estudante);

alter table situacao_estudante enable row level security;

drop policy if exists "situacao_auth_read" on situacao_estudante;
drop policy if exists "situacao_auth_write" on situacao_estudante;

-- Só quem tem sessão iniciada (estudante ou secretaria) pode ler.
create policy "situacao_auth_read" on situacao_estudante
  for select to authenticated using (true);

-- Só quem tem sessão iniciada pode escrever (o painel /gestao já exige sessão).
create policy "situacao_auth_write" on situacao_estudante
  for all to authenticated using (true) with check (true);
