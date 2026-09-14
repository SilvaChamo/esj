# Tarefas para quando voltares — ESJ

O código já está no projecto. Falta só o que precisa da tua conta Supabase e da secretaria.

## 1. Criar a tabela da pauta (obrigatório)

1. Abre o SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
2. Cola o conteúdo de `supabase/pauta-admissao.sql` (é só o extra; o resto do site já usa as tabelas antigas).
3. Carrega **Run**.
4. Confirma que a tabela `pauta_admissao` aparece e que há linhas de exemplo de Jornalismo (Diurno e Pós-laboral).

No painel (`/gestao` → Resultados), se ainda aparecer “Criar as tabelas”, usa **COPIAR SQL** e corre o schema completo.

## 2. Verificar o fluxo no sítio

1. Página inicial → separador **Calendário Académico**.
2. No card **Inscrições**, escolhe Licenciatura + Pós-laboral e clica **Inscrever-se**.
3. Confirma que o boletim em `/inscricao` chega com nível e regime bloqueados.
4. Abre `/resultados`, muda os filtros da barra lateral, clica no card **Jornalismo**.
5. Confirma a pauta: letras A–Z, número a descer, apelido, nome, Português 50%, História 50%, média, Admitido / Não admitido.

## 3. Substituir a lista de demonstração

As notas de exemplo (Bila, Chissano, Dava, etc.) servem só para ver a pauta. Quando tiveres as notas reais:

1. Entra em `/gestao` → **Resultados**.
2. Escolhe nível, regime e curso.
3. Remove as linhas de exemplo.
4. Adiciona apelido, nome, nota de Português e nota de História (escala 0–20).
5. Marca **Publicar** em cada linha que deve aparecer no sítio.

A média é calculada sozinha: `(Português × 50%) + (História × 50%)`. Admitido se média ≥ 10,00.

## 4. Depois, se quiseres

- Correr o mesmo SQL em produção, se o site público ainda não tiver a tabela.
- Imprimir a pauta (o cabeçalho com o logo da ESJ está preparado).
- Dizer se a numeração deve ser por mérito (melhor média = n.º 1) em vez de alfabética com número a descer.
