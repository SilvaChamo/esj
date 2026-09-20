-- ESJ — Cadeiras adicionais por curso
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
--
-- O catálogo de cadeiras (lib/curriculo.ts) só tem o plano completo de
-- Jornalismo diurno; os outros cursos/regimes têm poucas entradas. Esta
-- tabela permite à secretaria acrescentar cadeiras a qualquer curso a partir
-- da própria interface de gestão, sem precisar de alterar código.

create table if not exists cadeiras_adicionais (
  id uuid primary key default gen_random_uuid(),
  curso text not null check (
    curso in ('jornalismo', 'publicidade-e-marketing', 'relacoes-publicas', 'biblioteconomia-e-documentacao')
  ),
  codigo text not null,
  nome text not null,
  ano int not null check (ano between 1 and 4),
  semestre int not null check (semestre in (1, 2)),
  created_at timestamptz not null default now(),
  unique (curso, codigo)
);

alter table cadeiras_adicionais enable row level security;

drop policy if exists "cadeiras_adicionais_read" on cadeiras_adicionais;
drop policy if exists "cadeiras_adicionais_write" on cadeiras_adicionais;

-- Leitura: qualquer conta autenticada — é só o catálogo de nomes/códigos de
-- cadeiras, não dados sensíveis de ninguém (mesmo critério de turma_estudantes).
create policy "cadeiras_adicionais_read"
  on cadeiras_adicionais for select to authenticated using (true);

-- Sem política de escrita para utilizadores autenticados: acrescentar uma
-- cadeira ao catálogo é acto da secretaria e passa sempre pela rota
-- /api/cadeiras-adicionais, que confirma super-admin e usa a chave de serviço
-- (o mesmo critério de situacao_estudante e docencia_cadeiras) — caso
-- contrário qualquer conta autenticada (incluindo um estudante) poderia
-- inserir cadeiras falsas directamente pela API do Supabase.
