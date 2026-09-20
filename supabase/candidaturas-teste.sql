-- ESJ — 20 candidaturas de TESTE, para experimentar a conciliação
-- candidatura → pauta → conta de estudante (ver supabase/candidatura-pauta-numeracao.sql).
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
-- Corre isto DEPOIS de candidatura-pauta-numeracao.sql.
--
-- Só cria candidaturas (tabela inscricoes) — de propósito, sem notas nem
-- pauta pré-preenchidas, para poderes testar o fluxo completo a partir do
-- painel: Candidaturas → "Lançar resultado" → conta criada automaticamente
-- quando a média der Admitido (≥ 10).
--
-- Protocolo com o prefixo ESJ-2026-TESTE, para serem fáceis de identificar
-- e apagar mais tarde:
--   delete from inscricoes where protocolo like 'ESJ-2026-TESTE%';

insert into inscricoes (protocolo, nome, email, telefone, curso, turno, nivel, delegacao)
values
  ('ESJ-2026-TESTE01', 'Amélia Sitoe Machava', 'amelia.machava.teste@esj-teste.mz', '841000001', 'Licenciatura em Jornalismo', 'Diurno', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE02', 'Bruno Fernando Cossa', 'bruno.cossa.teste@esj-teste.mz', '841000002', 'Licenciatura em Jornalismo', 'Diurno', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE03', 'Celina Armando Nhantumbo', 'celina.nhantumbo.teste@esj-teste.mz', '841000003', 'Licenciatura em Jornalismo', 'Pós-laboral', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE04', 'Dinis Paulo Mondlane', 'dinis.mondlane.teste@esj-teste.mz', '841000004', 'Licenciatura em Jornalismo', 'Pós-laboral', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE05', 'Elsa Vasco Tembe', 'elsa.tembe.teste@esj-teste.mz', '841000005', 'Licenciatura em Jornalismo', 'Diurno', 'Licenciatura', 'Manica (Delegação Académica)'),
  ('ESJ-2026-TESTE06', 'Fernando Alberto Chissano', 'fernando.chissano.teste@esj-teste.mz', '841000006', 'Licenciatura em Publicidade e Marketing', 'Diurno', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE07', 'Graça Emília Muianga', 'graca.muianga.teste@esj-teste.mz', '841000007', 'Licenciatura em Publicidade e Marketing', 'Diurno', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE08', 'Hélder Domingos Nhaca', 'helder.nhaca.teste@esj-teste.mz', '841000008', 'Licenciatura em Publicidade e Marketing', 'Pós-laboral', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE09', 'Isaura Manuel Chirinza', 'isaura.chirinza.teste@esj-teste.mz', '841000009', 'Licenciatura em Publicidade e Marketing', 'Pós-laboral', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE10', 'João Ernesto Bila', 'joao.bila.teste@esj-teste.mz', '841000010', 'Licenciatura em Publicidade e Marketing', 'Diurno', 'Licenciatura', 'Manica (Delegação Académica)'),
  ('ESJ-2026-TESTE11', 'Karina Salomão Guambe', 'karina.guambe.teste@esj-teste.mz', '841000011', 'Licenciatura em Relações Públicas', 'Diurno', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE12', 'Lourenço Ismael Macuácua', 'lourenco.macuacua.teste@esj-teste.mz', '841000012', 'Licenciatura em Relações Públicas', 'Diurno', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE13', 'Marta Filipe Nhassengo', 'marta.nhassengo.teste@esj-teste.mz', '841000013', 'Licenciatura em Relações Públicas', 'Pós-laboral', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE14', 'Nelson Custódio Zunguze', 'nelson.zunguze.teste@esj-teste.mz', '841000014', 'Licenciatura em Relações Públicas', 'Pós-laboral', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE15', 'Otília Agostinho Sumbana', 'otilia.sumbana.teste@esj-teste.mz', '841000015', 'Licenciatura em Relações Públicas', 'Diurno', 'Licenciatura', 'Manica (Delegação Académica)'),
  ('ESJ-2026-TESTE16', 'Paulo Ricardo Chauque', 'paulo.chauque.teste@esj-teste.mz', '841000016', 'Licenciatura em Biblioteconomia e Documentação', 'Diurno', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE17', 'Quitéria Nazaré Langa', 'quiteria.langa.teste@esj-teste.mz', '841000017', 'Licenciatura em Biblioteconomia e Documentação', 'Diurno', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE18', 'Ricardo Simião Matsinhe', 'ricardo.matsinhe.teste@esj-teste.mz', '841000018', 'Licenciatura em Biblioteconomia e Documentação', 'Pós-laboral', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE19', 'Sara Domingas Cumbe', 'sara.cumbe.teste@esj-teste.mz', '841000019', 'Licenciatura em Biblioteconomia e Documentação', 'Pós-laboral', 'Licenciatura', 'Maputo (Sede)'),
  ('ESJ-2026-TESTE20', 'Tomás Alexandre Mabjaia', 'tomas.mabjaia.teste@esj-teste.mz', '841000020', 'Licenciatura em Biblioteconomia e Documentação', 'Diurno', 'Licenciatura', 'Manica (Delegação Académica)')
on conflict (protocolo) do nothing;
