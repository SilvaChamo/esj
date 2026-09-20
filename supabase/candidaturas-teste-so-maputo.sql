-- ESJ — corrige as candidaturas de teste que ainda tinham "Manica" como
-- delegação (o site só aceita Maputo por enquanto — ver DELEGACOES em
-- lib/inscricao.ts). Só toca nas candidaturas de teste (protocolo
-- "ESJ-2026-TESTE%"); não mexe em candidaturas reais.
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new

update inscricoes
set delegacao = 'Maputo (Sede)'
where protocolo like 'ESJ-2026-TESTE%'
  and delegacao ilike '%manica%';
