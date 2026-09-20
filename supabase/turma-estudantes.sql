-- ESJ — Turma (lista real de estudantes por curso/regime/ano)
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new
--
-- Resolve a falta de uma "lista de matrícula": o docente, ao lançar notas
-- numa cadeira, passa a ver logo os estudantes reais dessa turma (curso +
-- regime + ano), em vez de ter de os pesquisar um a um às cegas. Vem da
-- lista real da turma de Jornalismo 1º Ano (Sala 1 Laboral e Pós-Laboral).
-- Só entram aqui as linhas com número de estudante legível no documento —
-- linhas sem número não foram inventadas.

create table if not exists turma_estudantes (
  id uuid primary key default gen_random_uuid(),
  numero_estudante text not null,
  nome text not null,
  curso text not null check (
    curso in ('jornalismo', 'publicidade-e-marketing', 'relacoes-publicas', 'biblioteconomia-e-documentacao')
  ),
  regime text not null check (regime in ('diurno', 'pos-laboral')),
  ano int not null,
  created_at timestamptz not null default now(),
  unique (numero_estudante, curso)
);

create index if not exists turma_estudantes_turma_idx on turma_estudantes (curso, regime, ano);

alter table turma_estudantes enable row level security;

drop policy if exists "turma_estudantes_read" on turma_estudantes;
drop policy if exists "turma_estudantes_write" on turma_estudantes;
drop policy if exists "turma_estudantes_insert_self" on turma_estudantes;
drop policy if exists "turma_estudantes_update_self" on turma_estudantes;

-- Leitura: qualquer conta autenticada (docente/secretaria) — é só a lista de
-- nomes/números da turma, não dados sensíveis de cada estudante.
create policy "turma_estudantes_read"
  on turma_estudantes for select to authenticated using (true);

-- Sem política de escrita para "authenticated": todas as escritas (o
-- auto-registo público a juntar-se à turma real, e a gestão pela secretaria)
-- passam pela chave de serviço em /api/registo-estudante e
-- /api/estudantes-contas, nunca directamente do browser.
--
-- Já existiu aqui uma política "self" que comparava numero_estudante com
-- auth.jwt() -> 'user_metadata' ->> 'numero_estudante' — foi removida porque
-- user_metadata é editável pelo próprio utilizador (supabase.auth.updateUser),
-- logo qualquer conta autenticada podia declarar-se com o número de outro
-- estudante e reescrever a linha dele. A identidade autoritativa agora vive
-- em app_metadata (só a chave de serviço escreve), verificada em
-- /api/registo-estudante antes de qualquer upsert.

insert into turma_estudantes (numero_estudante, nome, curso, regime, ano)
select * from (values
  -- Jornalismo · 1º Ano · Diurno (Sala 1 — Laboral)
  ('20210101MP', 'Miguel Rafael Albino', 'jornalismo', 'diurno', 1),
  ('20210102MP', 'Flora Mário Aly', 'jornalismo', 'diurno', 1),
  ('20210103MP', 'Siete José Fernando Chirindze', 'jornalismo', 'diurno', 1),
  ('20210104MP', 'Edvige Ana Sidónio Chissumba', 'jornalismo', 'diurno', 1),
  ('20210105MP', 'Shilde Reginalda Chivambo', 'jornalismo', 'diurno', 1),
  ('20210106MP', 'Líria Salva Cumbane', 'jornalismo', 'diurno', 1),
  ('20210107MP', 'Marlene Absalão Dimande', 'jornalismo', 'diurno', 1),
  ('20210108MP', 'Neusa de Lurdes Dimas', 'jornalismo', 'diurno', 1),
  ('20210109MP', 'Marlene Américo Feliciano', 'jornalismo', 'diurno', 1),
  ('20210110MP', 'Nekicha Vasco Felisberto', 'jornalismo', 'diurno', 1),
  ('20210111MP', 'Elda Paulo Guambe', 'jornalismo', 'diurno', 1),
  ('20210112MP', 'Vallone de Menezes Guambe', 'jornalismo', 'diurno', 1),
  ('20210113MP', 'Maria Isabel', 'jornalismo', 'diurno', 1),
  ('20210114MP', 'Sérgio Lázaro Jairosse', 'jornalismo', 'diurno', 1),
  ('20210115MP', 'Anabele Rafael Langa', 'jornalismo', 'diurno', 1),
  ('20210116MP', 'Maria Petrosse Magumezule', 'jornalismo', 'diurno', 1),
  ('20210117MP', 'Carla Tiago Mahumane', 'jornalismo', 'diurno', 1),
  ('20210118MP', 'Milagrosa Efraime Manhique', 'jornalismo', 'diurno', 1),
  ('20210119MP', 'Sara Guidione Mathe', 'jornalismo', 'diurno', 1),
  ('20210120MP', 'Goi José Matola', 'jornalismo', 'diurno', 1),
  ('20210121MP', 'Elton Esmeralda Mauricio', 'jornalismo', 'diurno', 1),
  ('20210122MP', 'Cristine Israel Devs Mavie', 'jornalismo', 'diurno', 1),
  ('20210123MP', 'Vidilina Estevão Muadua', 'jornalismo', 'diurno', 1),
  ('20210124MP', 'Luísa João Muhambe', 'jornalismo', 'diurno', 1),
  ('20210125MP', 'Lucrêcia Gilberto Bene Mulando', 'jornalismo', 'diurno', 1),
  ('20210126MP', 'Regina Olívia Naete', 'jornalismo', 'diurno', 1),
  ('20210127MP', 'Tanêa Horácio Nhachengo', 'jornalismo', 'diurno', 1),
  ('20210128MP', 'Jaime Romão Nhamatate', 'jornalismo', 'diurno', 1),
  ('20210129MP', 'Fernanda Timóteo Nhamundze', 'jornalismo', 'diurno', 1),
  ('20210130MP', 'Fraléria Frazeldo Nhantumbo', 'jornalismo', 'diurno', 1),
  ('20210131MP', 'Carmínia Artur Nhassavele', 'jornalismo', 'diurno', 1),
  ('20210132MP', 'Lily John Nhauche', 'jornalismo', 'diurno', 1),
  ('20210133MP', 'Emília Antunes Pedro', 'jornalismo', 'diurno', 1),
  ('20210134MP', 'Dario Abel Xavier Samuel', 'jornalismo', 'diurno', 1),
  ('20210135MP', 'Faiza Azélio Simango', 'jornalismo', 'diurno', 1),
  ('20210136MP', 'Zinaid Nilza Tamele', 'jornalismo', 'diurno', 1),
  ('20210137MP', 'Rafael André Thovele', 'jornalismo', 'diurno', 1),
  ('20210138MP', 'Sheila Filomena Joaquim Tovele', 'jornalismo', 'diurno', 1),
  ('20210139MP', 'Ligio António Ugembe', 'jornalismo', 'diurno', 1),
  ('20210140MP', 'Alfredo Vasco Umbisse', 'jornalismo', 'diurno', 1),
  ('20210141MP', 'Ferdinado Vinagre Maria', 'jornalismo', 'diurno', 1),
  ('20210142MP', 'Ofélia António Alfaiate Arijuane', 'jornalismo', 'diurno', 1),
  ('20210143MP', 'Francisco Joaquim', 'jornalismo', 'diurno', 1),
  ('20210144MP', 'Saugira Manuel Lumbela', 'jornalismo', 'diurno', 1),
  ('20210145MP', 'Marcia Regina José Massingue', 'jornalismo', 'diurno', 1),
  ('20210446MP', 'Salmina Ezequiel Fulane', 'jornalismo', 'diurno', 1),
  ('20210447MP', 'Malaika Nacilia Jamaldine', 'jornalismo', 'diurno', 1),
  ('20130124MP', 'José Alfredo Cone', 'jornalismo', 'diurno', 1),
  ('20200136MP', 'Cristina Jonas Tembe', 'jornalismo', 'diurno', 1),
  ('20200118MP', 'Samantha César Mavume', 'jornalismo', 'diurno', 1),
  ('20200109MP', 'Castigo Júlio Júlio', 'jornalismo', 'diurno', 1),
  ('20170113MP', 'Amélia da Costa Mpfumo', 'jornalismo', 'diurno', 1),
  ('20190135MP', 'Sarifa Daúto Ussumane Ismael', 'jornalismo', 'diurno', 1),
  ('20180102MP', 'Elica Olimpio Cumbane', 'jornalismo', 'diurno', 1),
  ('20190147MP', 'Silvano Silvestre Chamo', 'jornalismo', 'diurno', 1),

  -- Jornalismo · 1º Ano · Pós-laboral (Sala 1 — Pós-Laboral)
  ('20210151MP', 'Deolindo Pedro P. da Costa Brites', 'jornalismo', 'pos-laboral', 1),
  ('20210152MP', 'Vanessa Sérgio Chiango', 'jornalismo', 'pos-laboral', 1),
  ('20210153MP', 'Sarifa João Chirindza', 'jornalismo', 'pos-laboral', 1),
  ('20210154MP', 'Erica Andrade Cumabane', 'jornalismo', 'pos-laboral', 1),
  ('20210155MP', 'Danilo Carlos Fumo', 'jornalismo', 'pos-laboral', 1),
  ('20210156MP', 'Rosalina da Isaura Joao', 'jornalismo', 'pos-laboral', 1),
  ('20210158MP', 'Daçalina Nelson Machava', 'jornalismo', 'pos-laboral', 1),
  ('20210159MP', 'Naudia Carolina Malate', 'jornalismo', 'pos-laboral', 1),
  ('20210160MP', 'Octavio Samuel Matusse', 'jornalismo', 'pos-laboral', 1),
  ('20210161MP', 'Biute Benedito Mavie', 'jornalismo', 'pos-laboral', 1),
  ('20210162MP', 'Isabel Bartolomeu Mawelele', 'jornalismo', 'pos-laboral', 1),
  ('20210163MP', 'Tomás João Mitema', 'jornalismo', 'pos-laboral', 1),
  ('20210164MP', 'Edson dos Santos Nhamposse', 'jornalismo', 'pos-laboral', 1),
  ('20210165MP', 'Hélia David Nhanengue', 'jornalismo', 'pos-laboral', 1),
  ('20210166MP', 'Hamilton Boavida Simbine', 'jornalismo', 'pos-laboral', 1),
  ('20210167MP', 'Elsa Henrique Siquice', 'jornalismo', 'pos-laboral', 1),
  ('20210168MP', 'Alberto Laurinda Sousa', 'jornalismo', 'pos-laboral', 1),
  ('20210169MP', 'Deolinda Salva Tamele', 'jornalismo', 'pos-laboral', 1),
  ('20210170MP', 'Elisa Abel Tcheco', 'jornalismo', 'pos-laboral', 1),
  ('20210171MP', 'Menalda Rui Tonela', 'jornalismo', 'pos-laboral', 1),
  ('20210172MP', 'Elisa Firmito Zombene', 'jornalismo', 'pos-laboral', 1),
  ('20210173MP', 'Márcia Vasco Umbisse', 'jornalismo', 'pos-laboral', 1),
  ('20210174MP', 'Jéssica Elisabeth Lapone', 'jornalismo', 'pos-laboral', 1),
  ('20210175MP', 'Liliana Lucrécia Mabunda', 'jornalismo', 'pos-laboral', 1),
  ('20210176MP', 'Laurinda Emilsa Félix Bila', 'jornalismo', 'pos-laboral', 1),
  ('20210177MP', 'Maria Cacilda Chelene', 'jornalismo', 'pos-laboral', 1),
  ('20210178MP', 'Chailete Carlos Paulo', 'jornalismo', 'pos-laboral', 1),
  ('20210179MP', 'Linda Custódio Timba', 'jornalismo', 'pos-laboral', 1),
  ('20210180MP', 'Alda Samuel Manganhe', 'jornalismo', 'pos-laboral', 1),
  ('20210181MP', 'Percia Da Jes. Cristovão Sortino', 'jornalismo', 'pos-laboral', 1),
  ('20210182MP', 'Emilio Higino Albuquerque Cossa', 'jornalismo', 'pos-laboral', 1),
  ('20210183MP', 'Albertina Julio Manjate', 'jornalismo', 'pos-laboral', 1),
  ('20200189MP', 'Nilza Simião Nharrave', 'jornalismo', 'pos-laboral', 1),
  ('20200155MP', 'Camila Erasmo Carangueza', 'jornalismo', 'pos-laboral', 1),
  ('20200182MP', 'Celina António Tembe', 'jornalismo', 'pos-laboral', 1),
  ('20190160MP', 'Camila Marcos Machiana', 'jornalismo', 'pos-laboral', 1),
  ('20180126MP', 'Camila Deyse Pedro Dauto', 'jornalismo', 'pos-laboral', 1),
  ('20180134MP', 'Zélia Salvador Chilamangane', 'jornalismo', 'pos-laboral', 1)
) as t(numero_estudante, nome, curso, regime, ano)
on conflict (numero_estudante, curso) do nothing;
