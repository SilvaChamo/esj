-- ESJ — Correcções da secretaria às cadeiras do catálogo estático
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
--
-- O catálogo base (lib/curriculo.ts) é código fixo. Esta tabela permite à
-- secretaria, a partir da página "Cadeiras" da Gestão, corrigir o nome/ano/
-- semestre de uma cadeira do catálogo, ou escondê-la (removida = true), sem
-- alterar código. Identificada por curso+codigo — o código nunca é alterado
-- aqui porque é a chave usada em docencia_cadeiras, docencia_materiais e nas
-- notas dos estudantes; mudar o código só é possível nas cadeiras acrescentadas
-- de raiz (tabela cadeiras_adicionais).

create table if not exists cadeiras_overrides (
  id uuid primary key default gen_random_uuid(),
  curso text not null check (
    curso in ('jornalismo', 'publicidade-e-marketing', 'relacoes-publicas', 'biblioteconomia-e-documentacao')
  ),
  codigo text not null,
  nome text,
  ano int check (ano between 1 and 4),
  semestre int check (semestre in (1, 2)),
  removida boolean not null default false,
  created_at timestamptz not null default now(),
  unique (curso, codigo)
);

alter table cadeiras_overrides enable row level security;

drop policy if exists "cadeiras_overrides_read" on cadeiras_overrides;
drop policy if exists "cadeiras_overrides_write" on cadeiras_overrides;

-- Leitura: qualquer conta autenticada — mesmo critério de cadeiras_adicionais.
create policy "cadeiras_overrides_read"
  on cadeiras_overrides for select to authenticated using (true);

-- Sem política de escrita para utilizadores autenticados: editar/esconder uma
-- cadeira do catálogo é acto da secretaria e passa sempre pela rota
-- /api/cadeiras-base, que confirma super-admin e usa a chave de serviço
-- (o mesmo critério de cadeiras_adicionais).
