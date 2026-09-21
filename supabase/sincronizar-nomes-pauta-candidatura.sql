-- ESJ — Nomes completos nas candidaturas de teste + sincroniza a pauta de
-- resultados a partir da candidatura (fonte principal)
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
--
-- As candidaturas de teste só tinham "Primeiro Apelido" (2 palavras) — por
-- isso a pauta pública só mostrava um único nome. Aqui acrescenta-se um
-- segundo nome a cada uma, e depois pauta_admissao.nome/apelido passam a
-- ser recalculados a partir do nome completo da candidatura ligada
-- (candidatura_protocolo), não um valor solto que pode ficar desactualizado.

-- 1) Nomes completos (segundo nome) nas 10 candidaturas de teste.
update inscricoes set nome = 'Amélia Maria Machava' where protocolo = 'ESJ-CA2026001';
update inscricoes set nome = 'Bruno Miguel Cossa' where protocolo = 'ESJ-CA2026002';
update inscricoes set nome = 'Celina Fernanda Nhantumbo' where protocolo = 'ESJ-CA2026003';
update inscricoes set nome = 'Dinis Eduardo Mondlane' where protocolo = 'ESJ-CA2026004';
update inscricoes set nome = 'Elsa Paula Tembe' where protocolo = 'ESJ-CA2026005';
update inscricoes set nome = 'Fernando José Chissano' where protocolo = 'ESJ-CA2026006';
update inscricoes set nome = 'Graça Isabel Muianga' where protocolo = 'ESJ-CA2026007';
update inscricoes set nome = 'Hélder António Nhaca' where protocolo = 'ESJ-CA2026008';
update inscricoes set nome = 'Isaura Cristina Chirinza' where protocolo = 'ESJ-CA2026009';
update inscricoes set nome = 'João Carlos Bila' where protocolo = 'ESJ-CA2026010';

-- 2) Sincroniza TODA a pauta_admissao ligada a uma candidatura — nome/
--    apelido passam a vir sempre do nome completo da candidatura, nunca
--    ficam divergentes. Mesma regra de separação de lib/admissao.ts::
--    separarNome (última palavra = apelido, o resto = nome). Não mexe em
--    linhas sem candidatura_protocolo (lançadas à mão, sem candidatura).
update pauta_admissao p
set
  apelido = regexp_replace(i.nome, '^.*\s', ''),
  nome = trim(regexp_replace(i.nome, '\s+\S+$', ''))
from inscricoes i
where p.candidatura_protocolo = i.protocolo;
