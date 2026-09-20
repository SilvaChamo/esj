-- ESJ — ligação candidatura → pauta de admissão + numeração automática de estudantes
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
-- Corre só este ficheiro se pauta-admissao.sql e turma-estudantes.sql já estiverem instalados.
--
-- Objectivo: a secretaria lança as notas do exame de admissão directamente a
-- partir da lista de Candidaturas (sem reescrever nome/curso, que já vêm da
-- candidatura), e a pauta electrónica em /resultados passa a preencher-se
-- sozinha a partir daí. Quando o candidato é admitido, a conta de estudante
-- é criada com um único clique, com o número de estudante gerado
-- automaticamente (nunca mais digitado à mão, um por um).

alter table pauta_admissao
  add column if not exists candidatura_protocolo text references inscricoes(protocolo) on delete set null;

create index if not exists pauta_admissao_protocolo_idx
  on pauta_admissao (candidatura_protocolo);

-- Regista qual candidatura deu origem a cada estudante da turma — evita
-- criar a conta duas vezes para o mesmo candidato.
alter table turma_estudantes
  add column if not exists candidatura_protocolo text references inscricoes(protocolo) on delete set null;

create index if not exists turma_estudantes_protocolo_idx
  on turma_estudantes (candidatura_protocolo);

-- Contador do PRÓXIMO número de estudante, por curso + regime. A secretaria
-- digita o número inicial UMA única vez (ex.: 20260001MP); a partir daí o
-- sistema gera os seguintes sozinho — incrementa a última sequência de
-- dígitos e mantém o resto do formato (ex.: 20260002MP, 20260003MP...).
create table if not exists numeracao_estudantes (
  curso text not null check (
    curso in ('jornalismo', 'publicidade-e-marketing', 'relacoes-publicas', 'biblioteconomia-e-documentacao')
  ),
  regime text not null check (regime in ('diurno', 'pos-laboral')),
  proximo_numero text not null,
  updated_at timestamptz not null default now(),
  primary key (curso, regime)
);

alter table numeracao_estudantes enable row level security;
-- Sem políticas para "authenticated": tal como turma_estudantes, todas as
-- leituras/escritas passam pela chave de serviço em
-- /api/numeracao-estudantes, nunca directamente do browser.
