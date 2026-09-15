-- ESJ — schema Supabase Cloud
-- Colar no SQL Editor: https://supabase.com/dashboard/project/tsozqadxoujocwxqxorg/sql/new

create table if not exists noticias (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  body text[] not null default '{}',
  image text not null,
  date_label text not null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists publicacoes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  authors text not null default '',
  date_label text not null default '',
  venue text not null default '',
  image text not null,
  tipo text not null default 'livro' check (tipo in ('livro', 'cartaz')),
  categoria text not null default 'livro' check (categoria in ('livro', 'evento')),
  destaque boolean not null default false,
  created_at timestamptz not null default now()
);

alter table publicacoes add column if not exists categoria text not null default 'livro';

create table if not exists livros (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image text not null,
  sort_order int not null default 0
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null default '',
  principal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists editais (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_url text not null,
  vigente boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists inscricoes (
  id uuid primary key default gen_random_uuid(),
  protocolo text unique not null,
  nome text not null,
  email text,
  telefone text,
  curso text not null,
  turno text,
  delegacao text,
  documentos jsonb not null default '{}',
  dados jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists anuncios (
  id uuid primary key default gen_random_uuid(),
  destinatarios text not null default 'Todos os estudantes',
  assunto text not null,
  mensagem text not null,
  created_at timestamptz not null default now()
);

create table if not exists newsletter (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists contactos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  mensagem text not null,
  created_at timestamptz not null default now()
);

create table if not exists calendario_academico (
  id int primary key default 1,
  inscricoes text not null default '',
  exames text not null default '',
  resultados text not null default '',
  inicio_ano text not null default '',
  updated_at timestamptz not null default now()
);

alter table noticias enable row level security;
alter table publicacoes enable row level security;
alter table livros enable row level security;
alter table videos enable row level security;
alter table editais enable row level security;
alter table inscricoes enable row level security;
alter table anuncios enable row level security;
alter table newsletter enable row level security;
alter table contactos enable row level security;
alter table calendario_academico enable row level security;

drop policy if exists "noticias_public_read" on noticias;
drop policy if exists "noticias_auth_write" on noticias;
drop policy if exists "publicacoes_public_read" on publicacoes;
drop policy if exists "publicacoes_auth_write" on publicacoes;
drop policy if exists "livros_public_read" on livros;
drop policy if exists "livros_auth_write" on livros;
drop policy if exists "videos_public_read" on videos;
drop policy if exists "videos_auth_write" on videos;
drop policy if exists "editais_public_read" on editais;
drop policy if exists "editais_auth_write" on editais;
drop policy if exists "inscricoes_public_insert" on inscricoes;
drop policy if exists "inscricoes_auth_read" on inscricoes;
drop policy if exists "anuncios_auth_all" on anuncios;
drop policy if exists "newsletter_public_insert" on newsletter;
drop policy if exists "newsletter_auth_read" on newsletter;
drop policy if exists "contactos_public_insert" on contactos;
drop policy if exists "contactos_auth_read" on contactos;
drop policy if exists "calendario_public_read" on calendario_academico;
drop policy if exists "calendario_auth_write" on calendario_academico;

create policy "noticias_public_read" on noticias for select using (true);
create policy "noticias_auth_write" on noticias for all to authenticated using (true) with check (true);
create policy "publicacoes_public_read" on publicacoes for select using (true);
create policy "publicacoes_auth_write" on publicacoes for all to authenticated using (true) with check (true);
create policy "livros_public_read" on livros for select using (true);
create policy "livros_auth_write" on livros for all to authenticated using (true) with check (true);
create policy "videos_public_read" on videos for select using (true);
create policy "videos_auth_write" on videos for all to authenticated using (true) with check (true);
create policy "editais_public_read" on editais for select using (true);
create policy "editais_auth_write" on editais for all to authenticated using (true) with check (true);
create policy "inscricoes_public_insert" on inscricoes for insert with check (true);
create policy "inscricoes_auth_read" on inscricoes for select to authenticated using (true);
create policy "anuncios_auth_all" on anuncios for all to authenticated using (true) with check (true);
create policy "newsletter_public_insert" on newsletter for insert with check (true);
create policy "newsletter_auth_read" on newsletter for select to authenticated using (true);
create policy "contactos_public_insert" on contactos for insert with check (true);
create policy "contactos_auth_read" on contactos for select to authenticated using (true);
create policy "calendario_public_read" on calendario_academico for select using (true);
create policy "calendario_auth_write" on calendario_academico for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('inscricoes', 'inscricoes', false)
on conflict (id) do nothing;

drop policy if exists "esj_media_public_read" on storage.objects;
drop policy if exists "esj_media_auth_write" on storage.objects;
drop policy if exists "esj_media_auth_update" on storage.objects;
drop policy if exists "esj_media_auth_delete" on storage.objects;
drop policy if exists "esj_inscricoes_insert" on storage.objects;
drop policy if exists "esj_inscricoes_auth_read" on storage.objects;

create policy "esj_media_public_read" on storage.objects
  for select using (bucket_id = 'media');
create policy "esj_media_auth_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "esj_media_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy "esj_media_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
create policy "esj_inscricoes_insert" on storage.objects
  for insert with check (bucket_id = 'inscricoes');
create policy "esj_inscricoes_auth_read" on storage.objects
  for select to authenticated using (bucket_id = 'inscricoes');

insert into noticias (slug, title, excerpt, body, image, date_label, published_at) values
(
  'conhecimento-que-conecta',
  'Em breve | Lançamento de Conhecimento que conecta',
  'A ESJ anuncia o lançamento da obra Experiências Metodológicas em Comunicação — conhecimento que conecta pessoas, ideias e realidades.',
  array[
    'A Escola Superior de Jornalismo anuncia o lançamento da obra Experiências Metodológicas em Comunicação, apresentada sob o mote Conhecimento que conecta pessoas, ideias e realidades.',
    'O livro reúne práticas, reflexões e caminhos metodológicos para uma comunicação mais crítica, estratégica e transformadora, ao serviço da formação e da investigação na ESJ.'
  ],
  '/livro-experiencias.jpg',
  'Setembro 2026',
  '2026-09-01'
),
(
  'lancamento-infovula',
  'Lançamento do livro Infovula',
  'Sérgio Langa e Joana Machuza apresentam Infovula na Galeria Porto de Maputo, numa sessão aberta à comunidade académica e ao público.',
  array[
    'Sérgio Langa e Joana Machuza apresentam Infovula na Galeria Porto de Maputo, numa sessão aberta à comunidade académica e ao público.',
    'A obra discute a qualidade da informação na televisão em Moçambique e reforça o papel da ESJ na produção e divulgação de conhecimento.'
  ],
  '/livro-infovula.jpg',
  '24 de Junho de 2026',
  '2026-06-24'
),
(
  'esj-18-anos',
  'ESJ celebra 18 anos de ensino',
  'A Escola Superior de Jornalismo assinala 18 anos a formar profissionais nas Ciências da Comunicação e da Informação, em Maputo e em Manica.',
  array[
    'A Escola Superior de Jornalismo assinala 18 anos a formar profissionais nas Ciências da Comunicação e da Informação.',
    'Com sede em Maputo e delegação académica em Manica, a instituição continua a ligar a sala de aula à redacção, à pesquisa e à vida pública.'
  ],
  '/studentes.jpg',
  '13 de Maio de 2026',
  '2026-05-13'
),
(
  'iii-conferencia-comunicacao',
  'III Conferência Internacional das Ciências da Comunicação',
  'Investigadores e profissionais reuniram-se no IPAJ, em Maputo, para debater o jornalismo, a era digital e o papel dos media na democracia.',
  array[
    'A III Conferência Internacional das Ciências da Comunicação reuniu investigadores e profissionais no IPAJ, em Maputo.',
    'O encontro debateu o jornalismo, os desafios da era digital e o papel dos media na consolidação da democracia moçambicana.'
  ],
  '/Confefencias.jpg',
  'Novembro 2025',
  '2025-11-05'
),
(
  'barometro-comunicacao-social',
  'ESJ apresenta o Barómetro da Comunicação Social',
  'O GABINFO apresentou o Barómetro da Comunicação Social, projecto da ESJ para reforçar a transparência e o pluralismo informativo no país.',
  array[
    'O Gabinete de Informação apresentou o Barómetro da Comunicação Social, projecto concebido pela Escola Superior de Jornalismo.',
    'A iniciativa pretende reforçar a transparência pública, o pluralismo informativo e a produção de conhecimento sobre o sector dos media em Moçambique.'
  ],
  '/Estudio.jpg',
  '4 de Setembro de 2026',
  '2026-09-04'
),
(
  'noivas-do-homem-maduro',
  'Lançamento de As Noivas do Homem Maduro',
  'Isaías Carlos Fuel apresenta As Noivas do Homem Maduro na sala de conferências da ESJ, com apresentação de Alexandre Dinis Zavala.',
  array[
    'A ESJ acolhe o lançamento de As Noivas do Homem Maduro, de Isaías Carlos Fuel, com apresentação de Alexandre Dinis Zavala.',
    'A sessão realiza-se na sala de conferências da escola e está aberta à comunidade académica.'
  ],
  '/livro-noivas.jpg',
  '25 de Maio de 2026',
  '2026-05-25'
),
(
  'exames-admissao-2026',
  'Exames de admissão ao ano lectivo 2026',
  'As provas de Português e História realizaram-se em todo o país, para as licenciaturas em Maputo e na delegação académica de Manica.',
  array[
    'Os exames de admissão à ESJ realizaram-se a 5 de Fevereiro de 2026, com provas de Português e História.',
    'As candidaturas decorreram de Novembro de 2025 a Janeiro de 2026, para as licenciaturas em Maputo e na delegação de Manica.'
  ],
  '/Banner-website-ESJ-Final4-3-1.jpg',
  '5 de Fevereiro de 2026',
  '2026-02-05'
),
(
  'jornalista-plataformas-digitais',
  'Jornalista deve dominar plataformas digitais',
  'Paulo da Conceição falou aos estudantes da ESJ sobre ética, verificação da informação e o domínio das plataformas digitais.',
  array[
    'O chefe da Redacção do Jornal Notícias, Paulo da Conceição, falou aos estudantes da ESJ sobre o perfil do jornalista na era digital.',
    'Sublinhou o domínio das plataformas digitais, o pensamento crítico, a ética e a capacidade de verificação perante a inteligência artificial.'
  ],
  '/Estudio.jpg',
  '26 de Março de 2026',
  '2026-03-26'
)
on conflict (slug) do nothing;

insert into publicacoes (title, subtitle, authors, date_label, venue, image, tipo, destaque)
select
  'Infovula',
  'Do pauperismo semântico à qualidade da informação da televisão em Moçambique',
  E'Sérgio Langa\nJoana Machuza',
  '24/06/2026',
  'Porto de Maputo',
  '/livro-infovula.jpg',
  'livro',
  true
where not exists (select 1 from publicacoes);

insert into publicacoes (title, subtitle, authors, date_label, venue, image, tipo, categoria, destaque)
select
  'Agenda de eventos da ESJ',
  'Conferências, colóquios e a Semana da Comunicação e Informação',
  '',
  'Brevemente',
  'Campus da ESJ, Maputo',
  '/Sala de conferencias.jpg',
  'cartaz',
  'evento',
  true
where not exists (select 1 from publicacoes where categoria = 'evento');

insert into calendario_academico (id, inscricoes, exames, resultados, inicio_ano)
select
  1,
  'O prazo de pré-inscrição para o ano lectivo 2026 encontra-se encerrado. O próximo período, para o ano lectivo 2027, deverá abrir em Novembro.',
  'Provas de Português e História, para todas as licenciaturas, nos regimes diurno e pós-laboral, em data e local a anunciar no edital do próximo ciclo de admissão.',
  'Divulgados pela Secretaria Académica através deste portal, após a correcção dos exames de admissão.',
  'Datas de matrículas, acolhimento aos novos estudantes e início das aulas publicadas no edital de admissão do próximo ciclo, disponível nesta página e em /edital.'
where not exists (select 1 from calendario_academico where id = 1);

insert into livros (title, image, sort_order)
select * from (values
  ('Infovula', '/livro-infovula.jpg', 1),
  ('As Noivas do Homem Maduro', '/livro-noivas.jpg', 2),
  ('Conhecimento que conecta', '/livro-experiencias.jpg', 3)
) as v(title, image, sort_order)
where not exists (select 1 from livros);

alter table inscricoes add column if not exists nivel text not null default 'Licenciatura';

alter table anuncios add column if not exists canal text not null default 'sms';
alter table anuncios add column if not exists enviados int not null default 0;
alter table anuncios add column if not exists falhados int not null default 0;

alter table noticias add column if not exists estado text not null default 'publicado';
alter table videos add column if not exists principal boolean not null default false;

drop policy if exists "noticias_public_read" on noticias;
create policy "noticias_public_read" on noticias
  for select using (coalesce(estado, 'publicado') = 'publicado');

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

insert into pauta_admissao
  (ano_lectivo, nivel, curso, regime, apelido, nome, nota_portugues, nota_historia, publicado)
select * from (values
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Alfredo', 'Ana Maria', 9.50, 7.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Banze', 'Carlos Eduardo', 14.00, 6.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Bila', 'Esperança', 12.50, 10.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Buque', 'João Pedro', 6.00, 12.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Chauque', 'Lurdes', 5.50, 11.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Chirindza', 'Pedro António', 6.00, 6.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Chissano', 'Fátima', 11.00, 16.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Come', 'Miguel', 6.50, 8.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Cossa', 'Helena', 14.00, 18.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Cuamba', 'Daniel', 13.00, 10.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Cuinica', 'Inês', 18.50, 5.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Cumbe', 'Rui', 17.00, 9.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Dava', 'Teresa', 7.00, 6.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Francisco', 'Armando', 9.50, 16.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Gove', 'Belinda', 7.50, 13.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Guambe', 'Custódio', 14.00, 10.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Langa', 'Deolinda', 12.50, 6.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Lichucha', 'Emídio', 6.00, 8.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Mabunda', 'Felismina', 14.50, 11.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Machaieie', 'Guilherme', 9.50, 13.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Machel', 'Hortência', 11.50, 9.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Mahumana', 'Ivan', 16.00, 15.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Mandlate', 'Jacinta', 8.50, 13.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Manjate', 'Kelvin', 12.50, 17.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Massinga', 'Leonor', 15.00, 9.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Matavele', 'Marcelino', 18.50, 6.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Matsimbe', 'Nádia', 11.00, 15.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Mavie', 'Osvaldo', 7.00, 12.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Mazuze', 'Palmira', 5.50, 14.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Mondlane', 'Quitéria', 15.50, 13.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Muchanga', 'Rogério', 17.50, 9.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Muianga', 'Sérgio', 14.50, 13.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Nacir', 'Tânia', 13.00, 11.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Nhaca', 'Ussene', 17.00, 18.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Nhamona', 'Vitória', 11.50, 14.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Nhantumbo', 'Wilson', 6.00, 15.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Nhassengo', 'Xavier', 14.00, 19.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Ngovene', 'Yolanda', 16.50, 9.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Novela', 'Zacarias', 10.50, 14.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Sambo', 'Adélia', 5.50, 11.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Simango', 'Bento', 7.50, 6.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Sitoe', 'Cremilda', 6.00, 16.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Sumbana', 'Domingos', 7.00, 8.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Tembe', 'Edna', 10.50, 17.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Timana', 'Faruk', 6.00, 11.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Tivane', 'Graciete', 12.50, 17.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Tovela', 'Hélio', 16.50, 17.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Ubisse', 'Isaura', 9.00, 11.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Wate', 'Júlio', 10.00, 17.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Zandamela', 'Lídia', 18.50, 7.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Zavala', 'Ana Maria', 7.50, 8.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Amade', 'Carlos Eduardo', 8.50, 12.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Bata', 'Esperança', 13.00, 8.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Chambal', 'João Pedro', 5.00, 11.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Dimande', 'Lurdes', 10.00, 13.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Estevao', 'Pedro António', 18.50, 14.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Faife', 'Fátima', 12.00, 13.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Guilundo', 'Miguel', 14.50, 6.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Hunguana', 'Helena', 17.50, 16.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Inguane', 'Daniel', 17.00, 16.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Jamal', 'Inês', 10.50, 10.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Kambeu', 'Rui', 6.50, 14.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Luis', 'Teresa', 6.00, 6.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Macuacua', 'Armando', 8.00, 7.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Nhabinde', 'Belinda', 10.00, 5.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Ossumane', 'Custódio', 5.00, 7.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Paulo', 'Deolinda', 6.50, 10.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Quisse', 'Emídio', 5.50, 17.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Rafael', 'Felismina', 13.50, 7.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Sitole', 'Guilherme', 8.50, 10.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Tamele', 'Hortência', 10.00, 6.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Uamusse', 'Ivan', 17.00, 19.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Vilanculos', 'Jacinta', 11.50, 12.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Wamusse', 'Kelvin', 6.00, 6.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Ximenes', 'Leonor', 10.00, 8.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Yassine', 'Marcelino', 16.50, 7.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Zunguza', 'Nádia', 5.50, 18.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Abudo', 'Osvaldo', 12.50, 7.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Bene', 'Palmira', 12.50, 5.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Coana', 'Quitéria', 12.50, 18.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Duma', 'Rogério', 17.00, 14.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Eugenio', 'Sérgio', 8.50, 10.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Fumo', 'Tânia', 7.50, 16.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Gundane', 'Ussene', 12.50, 16.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Homba', 'Vitória', 9.50, 8.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Iassine', 'Wilson', 16.50, 19.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Jose', 'Xavier', 17.00, 16.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Kalimo', 'Yolanda', 16.50, 15.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Lopes', 'Zacarias', 8.00, 12.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Mabjaia', 'Adélia', 10.00, 5.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Nhachungue', 'Bento', 5.50, 9.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Omar', 'Cremilda', 8.50, 14.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Pelembe', 'Domingos', 18.50, 11.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Quim', 'Edna', 18.00, 19.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Rungo', 'Faruk', 18.50, 10.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Salimo', 'Graciete', 8.00, 8.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Undela', 'Hélio', 8.00, 8.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Viola', 'Isaura', 13.50, 17.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Wetela', 'Júlio', 17.00, 11.50, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Diurno', 'Zeca', 'Lídia', 14.00, 16.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Pós-laboral', 'Alberto', 'Helena', 15.00, 14.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Pós-laboral', 'Cossa', 'Daniel', 10.00, 11.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Pós-laboral', 'Machel', 'Inês', 7.50, 8.00, true),
  ('2026', 'Licenciatura', 'Jornalismo', 'Pós-laboral', 'Tembe', 'Rui', 13.00, 12.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Alfredo', 'Ana Maria', 9.50, 7.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Banze', 'Carlos Eduardo', 14.00, 6.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Bila', 'Esperança', 12.50, 10.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Buque', 'João Pedro', 6.00, 12.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Chauque', 'Lurdes', 5.50, 11.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Chirindza', 'Pedro António', 6.00, 6.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Chissano', 'Fátima', 11.00, 16.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Come', 'Miguel', 6.50, 8.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Cossa', 'Helena', 14.00, 18.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Cuamba', 'Daniel', 13.00, 10.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Cuinica', 'Inês', 18.50, 5.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Cumbe', 'Rui', 17.00, 9.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Dava', 'Teresa', 7.00, 6.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Francisco', 'Armando', 9.50, 16.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Gove', 'Belinda', 7.50, 13.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Guambe', 'Custódio', 14.00, 10.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Langa', 'Deolinda', 12.50, 6.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Lichucha', 'Emídio', 6.00, 8.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Mabunda', 'Felismina', 14.50, 11.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Machaieie', 'Guilherme', 9.50, 13.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Machel', 'Hortência', 11.50, 9.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Mahumana', 'Ivan', 16.00, 15.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Mandlate', 'Jacinta', 8.50, 13.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Manjate', 'Kelvin', 12.50, 17.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Massinga', 'Leonor', 15.00, 9.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Matavele', 'Marcelino', 18.50, 6.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Matsimbe', 'Nádia', 11.00, 15.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Mavie', 'Osvaldo', 7.00, 12.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Mazuze', 'Palmira', 5.50, 14.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Mondlane', 'Quitéria', 15.50, 13.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Muchanga', 'Rogério', 17.50, 9.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Muianga', 'Sérgio', 14.50, 13.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Nacir', 'Tânia', 13.00, 11.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Nhaca', 'Ussene', 17.00, 18.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Nhamona', 'Vitória', 11.50, 14.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Nhantumbo', 'Wilson', 6.00, 15.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Nhassengo', 'Xavier', 14.00, 19.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Ngovene', 'Yolanda', 16.50, 9.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Novela', 'Zacarias', 10.50, 14.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Sambo', 'Adélia', 5.50, 11.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Simango', 'Bento', 7.50, 6.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Sitoe', 'Cremilda', 6.00, 16.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Sumbana', 'Domingos', 7.00, 8.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Tembe', 'Edna', 10.50, 17.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Timana', 'Faruk', 6.00, 11.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Tivane', 'Graciete', 12.50, 17.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Tovela', 'Hélio', 16.50, 17.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Ubisse', 'Isaura', 9.00, 11.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Wate', 'Júlio', 10.00, 17.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Zandamela', 'Lídia', 18.50, 7.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Zavala', 'Ana Maria', 7.50, 8.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Amade', 'Carlos Eduardo', 8.50, 12.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Bata', 'Esperança', 13.00, 8.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Chambal', 'João Pedro', 5.00, 11.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Dimande', 'Lurdes', 10.00, 13.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Estevao', 'Pedro António', 18.50, 14.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Faife', 'Fátima', 12.00, 13.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Guilundo', 'Miguel', 14.50, 6.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Hunguana', 'Helena', 17.50, 16.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Inguane', 'Daniel', 17.00, 16.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Jamal', 'Inês', 10.50, 10.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Kambeu', 'Rui', 6.50, 14.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Luis', 'Teresa', 6.00, 6.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Macuacua', 'Armando', 8.00, 7.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Nhabinde', 'Belinda', 10.00, 5.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Ossumane', 'Custódio', 5.00, 7.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Paulo', 'Deolinda', 6.50, 10.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Quisse', 'Emídio', 5.50, 17.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Rafael', 'Felismina', 13.50, 7.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Sitole', 'Guilherme', 8.50, 10.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Tamele', 'Hortência', 10.00, 6.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Uamusse', 'Ivan', 17.00, 19.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Vilanculos', 'Jacinta', 11.50, 12.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Wamusse', 'Kelvin', 6.00, 6.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Ximenes', 'Leonor', 10.00, 8.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Yassine', 'Marcelino', 16.50, 7.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Zunguza', 'Nádia', 5.50, 18.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Abudo', 'Osvaldo', 12.50, 7.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Bene', 'Palmira', 12.50, 5.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Coana', 'Quitéria', 12.50, 18.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Duma', 'Rogério', 17.00, 14.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Eugenio', 'Sérgio', 8.50, 10.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Fumo', 'Tânia', 7.50, 16.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Gundane', 'Ussene', 12.50, 16.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Homba', 'Vitória', 9.50, 8.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Iassine', 'Wilson', 16.50, 19.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Jose', 'Xavier', 17.00, 16.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Kalimo', 'Yolanda', 16.50, 15.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Lopes', 'Zacarias', 8.00, 12.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Mabjaia', 'Adélia', 10.00, 5.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Nhachungue', 'Bento', 5.50, 9.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Omar', 'Cremilda', 8.50, 14.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Pelembe', 'Domingos', 18.50, 11.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Quim', 'Edna', 18.00, 19.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Rungo', 'Faruk', 18.50, 10.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Salimo', 'Graciete', 8.00, 8.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Undela', 'Hélio', 8.00, 8.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Viola', 'Isaura', 13.50, 17.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Wetela', 'Júlio', 17.00, 11.50, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Diurno', 'Zeca', 'Lídia', 14.00, 16.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Pós-laboral', 'Alberto', 'Helena', 15.00, 14.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Pós-laboral', 'Cossa', 'Daniel', 10.00, 11.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Pós-laboral', 'Machel', 'Inês', 7.50, 8.00, true),
  ('2026', 'Licenciatura', 'Publicidade e Marketing', 'Pós-laboral', 'Tembe', 'Rui', 13.00, 12.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Alfredo', 'Ana Maria', 9.50, 7.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Banze', 'Carlos Eduardo', 14.00, 6.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Bila', 'Esperança', 12.50, 10.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Buque', 'João Pedro', 6.00, 12.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Chauque', 'Lurdes', 5.50, 11.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Chirindza', 'Pedro António', 6.00, 6.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Chissano', 'Fátima', 11.00, 16.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Come', 'Miguel', 6.50, 8.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Cossa', 'Helena', 14.00, 18.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Cuamba', 'Daniel', 13.00, 10.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Cuinica', 'Inês', 18.50, 5.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Cumbe', 'Rui', 17.00, 9.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Dava', 'Teresa', 7.00, 6.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Francisco', 'Armando', 9.50, 16.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Gove', 'Belinda', 7.50, 13.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Guambe', 'Custódio', 14.00, 10.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Langa', 'Deolinda', 12.50, 6.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Lichucha', 'Emídio', 6.00, 8.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Mabunda', 'Felismina', 14.50, 11.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Machaieie', 'Guilherme', 9.50, 13.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Machel', 'Hortência', 11.50, 9.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Mahumana', 'Ivan', 16.00, 15.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Mandlate', 'Jacinta', 8.50, 13.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Manjate', 'Kelvin', 12.50, 17.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Massinga', 'Leonor', 15.00, 9.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Matavele', 'Marcelino', 18.50, 6.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Matsimbe', 'Nádia', 11.00, 15.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Mavie', 'Osvaldo', 7.00, 12.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Mazuze', 'Palmira', 5.50, 14.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Mondlane', 'Quitéria', 15.50, 13.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Muchanga', 'Rogério', 17.50, 9.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Muianga', 'Sérgio', 14.50, 13.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Nacir', 'Tânia', 13.00, 11.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Nhaca', 'Ussene', 17.00, 18.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Nhamona', 'Vitória', 11.50, 14.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Nhantumbo', 'Wilson', 6.00, 15.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Nhassengo', 'Xavier', 14.00, 19.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Ngovene', 'Yolanda', 16.50, 9.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Novela', 'Zacarias', 10.50, 14.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Sambo', 'Adélia', 5.50, 11.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Simango', 'Bento', 7.50, 6.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Sitoe', 'Cremilda', 6.00, 16.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Sumbana', 'Domingos', 7.00, 8.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Tembe', 'Edna', 10.50, 17.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Timana', 'Faruk', 6.00, 11.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Tivane', 'Graciete', 12.50, 17.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Tovela', 'Hélio', 16.50, 17.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Ubisse', 'Isaura', 9.00, 11.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Wate', 'Júlio', 10.00, 17.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Zandamela', 'Lídia', 18.50, 7.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Zavala', 'Ana Maria', 7.50, 8.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Amade', 'Carlos Eduardo', 8.50, 12.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Bata', 'Esperança', 13.00, 8.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Chambal', 'João Pedro', 5.00, 11.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Dimande', 'Lurdes', 10.00, 13.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Estevao', 'Pedro António', 18.50, 14.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Faife', 'Fátima', 12.00, 13.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Guilundo', 'Miguel', 14.50, 6.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Hunguana', 'Helena', 17.50, 16.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Inguane', 'Daniel', 17.00, 16.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Jamal', 'Inês', 10.50, 10.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Kambeu', 'Rui', 6.50, 14.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Luis', 'Teresa', 6.00, 6.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Macuacua', 'Armando', 8.00, 7.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Nhabinde', 'Belinda', 10.00, 5.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Ossumane', 'Custódio', 5.00, 7.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Paulo', 'Deolinda', 6.50, 10.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Quisse', 'Emídio', 5.50, 17.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Rafael', 'Felismina', 13.50, 7.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Sitole', 'Guilherme', 8.50, 10.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Tamele', 'Hortência', 10.00, 6.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Uamusse', 'Ivan', 17.00, 19.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Vilanculos', 'Jacinta', 11.50, 12.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Wamusse', 'Kelvin', 6.00, 6.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Ximenes', 'Leonor', 10.00, 8.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Yassine', 'Marcelino', 16.50, 7.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Zunguza', 'Nádia', 5.50, 18.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Abudo', 'Osvaldo', 12.50, 7.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Bene', 'Palmira', 12.50, 5.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Coana', 'Quitéria', 12.50, 18.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Duma', 'Rogério', 17.00, 14.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Eugenio', 'Sérgio', 8.50, 10.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Fumo', 'Tânia', 7.50, 16.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Gundane', 'Ussene', 12.50, 16.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Homba', 'Vitória', 9.50, 8.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Iassine', 'Wilson', 16.50, 19.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Jose', 'Xavier', 17.00, 16.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Kalimo', 'Yolanda', 16.50, 15.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Lopes', 'Zacarias', 8.00, 12.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Mabjaia', 'Adélia', 10.00, 5.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Nhachungue', 'Bento', 5.50, 9.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Omar', 'Cremilda', 8.50, 14.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Pelembe', 'Domingos', 18.50, 11.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Quim', 'Edna', 18.00, 19.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Rungo', 'Faruk', 18.50, 10.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Salimo', 'Graciete', 8.00, 8.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Undela', 'Hélio', 8.00, 8.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Viola', 'Isaura', 13.50, 17.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Wetela', 'Júlio', 17.00, 11.50, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Diurno', 'Zeca', 'Lídia', 14.00, 16.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Pós-laboral', 'Alberto', 'Helena', 15.00, 14.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Pós-laboral', 'Cossa', 'Daniel', 10.00, 11.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Pós-laboral', 'Machel', 'Inês', 7.50, 8.00, true),
  ('2026', 'Licenciatura', 'Relações Públicas', 'Pós-laboral', 'Tembe', 'Rui', 13.00, 12.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Alfredo', 'Ana Maria', 9.50, 7.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Banze', 'Carlos Eduardo', 14.00, 6.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Bila', 'Esperança', 12.50, 10.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Buque', 'João Pedro', 6.00, 12.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Chauque', 'Lurdes', 5.50, 11.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Chirindza', 'Pedro António', 6.00, 6.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Chissano', 'Fátima', 11.00, 16.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Come', 'Miguel', 6.50, 8.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Cossa', 'Helena', 14.00, 18.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Cuamba', 'Daniel', 13.00, 10.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Cuinica', 'Inês', 18.50, 5.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Cumbe', 'Rui', 17.00, 9.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Dava', 'Teresa', 7.00, 6.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Francisco', 'Armando', 9.50, 16.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Gove', 'Belinda', 7.50, 13.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Guambe', 'Custódio', 14.00, 10.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Langa', 'Deolinda', 12.50, 6.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Lichucha', 'Emídio', 6.00, 8.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Mabunda', 'Felismina', 14.50, 11.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Machaieie', 'Guilherme', 9.50, 13.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Machel', 'Hortência', 11.50, 9.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Mahumana', 'Ivan', 16.00, 15.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Mandlate', 'Jacinta', 8.50, 13.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Manjate', 'Kelvin', 12.50, 17.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Massinga', 'Leonor', 15.00, 9.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Matavele', 'Marcelino', 18.50, 6.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Matsimbe', 'Nádia', 11.00, 15.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Mavie', 'Osvaldo', 7.00, 12.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Mazuze', 'Palmira', 5.50, 14.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Mondlane', 'Quitéria', 15.50, 13.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Muchanga', 'Rogério', 17.50, 9.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Muianga', 'Sérgio', 14.50, 13.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Nacir', 'Tânia', 13.00, 11.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Nhaca', 'Ussene', 17.00, 18.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Nhamona', 'Vitória', 11.50, 14.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Nhantumbo', 'Wilson', 6.00, 15.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Nhassengo', 'Xavier', 14.00, 19.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Ngovene', 'Yolanda', 16.50, 9.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Novela', 'Zacarias', 10.50, 14.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Sambo', 'Adélia', 5.50, 11.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Simango', 'Bento', 7.50, 6.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Sitoe', 'Cremilda', 6.00, 16.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Sumbana', 'Domingos', 7.00, 8.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Tembe', 'Edna', 10.50, 17.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Timana', 'Faruk', 6.00, 11.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Tivane', 'Graciete', 12.50, 17.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Tovela', 'Hélio', 16.50, 17.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Ubisse', 'Isaura', 9.00, 11.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Wate', 'Júlio', 10.00, 17.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Zandamela', 'Lídia', 18.50, 7.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Zavala', 'Ana Maria', 7.50, 8.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Amade', 'Carlos Eduardo', 8.50, 12.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Bata', 'Esperança', 13.00, 8.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Chambal', 'João Pedro', 5.00, 11.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Dimande', 'Lurdes', 10.00, 13.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Estevao', 'Pedro António', 18.50, 14.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Faife', 'Fátima', 12.00, 13.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Guilundo', 'Miguel', 14.50, 6.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Hunguana', 'Helena', 17.50, 16.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Inguane', 'Daniel', 17.00, 16.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Jamal', 'Inês', 10.50, 10.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Kambeu', 'Rui', 6.50, 14.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Luis', 'Teresa', 6.00, 6.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Macuacua', 'Armando', 8.00, 7.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Nhabinde', 'Belinda', 10.00, 5.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Ossumane', 'Custódio', 5.00, 7.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Paulo', 'Deolinda', 6.50, 10.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Quisse', 'Emídio', 5.50, 17.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Rafael', 'Felismina', 13.50, 7.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Sitole', 'Guilherme', 8.50, 10.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Tamele', 'Hortência', 10.00, 6.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Uamusse', 'Ivan', 17.00, 19.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Vilanculos', 'Jacinta', 11.50, 12.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Wamusse', 'Kelvin', 6.00, 6.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Ximenes', 'Leonor', 10.00, 8.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Yassine', 'Marcelino', 16.50, 7.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Zunguza', 'Nádia', 5.50, 18.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Abudo', 'Osvaldo', 12.50, 7.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Bene', 'Palmira', 12.50, 5.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Coana', 'Quitéria', 12.50, 18.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Duma', 'Rogério', 17.00, 14.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Eugenio', 'Sérgio', 8.50, 10.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Fumo', 'Tânia', 7.50, 16.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Gundane', 'Ussene', 12.50, 16.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Homba', 'Vitória', 9.50, 8.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Iassine', 'Wilson', 16.50, 19.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Jose', 'Xavier', 17.00, 16.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Kalimo', 'Yolanda', 16.50, 15.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Lopes', 'Zacarias', 8.00, 12.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Mabjaia', 'Adélia', 10.00, 5.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Nhachungue', 'Bento', 5.50, 9.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Omar', 'Cremilda', 8.50, 14.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Pelembe', 'Domingos', 18.50, 11.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Quim', 'Edna', 18.00, 19.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Rungo', 'Faruk', 18.50, 10.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Salimo', 'Graciete', 8.00, 8.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Undela', 'Hélio', 8.00, 8.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Viola', 'Isaura', 13.50, 17.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Wetela', 'Júlio', 17.00, 11.50, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Diurno', 'Zeca', 'Lídia', 14.00, 16.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Pós-laboral', 'Alberto', 'Helena', 15.00, 14.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Pós-laboral', 'Cossa', 'Daniel', 10.00, 11.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Pós-laboral', 'Machel', 'Inês', 7.50, 8.00, true),
  ('2026', 'Licenciatura', 'Biblioteconomia e Documentação', 'Pós-laboral', 'Tembe', 'Rui', 13.00, 12.50, true)
) as v(ano_lectivo, nivel, curso, regime, apelido, nome, nota_portugues, nota_historia, publicado)
where not exists (select 1 from pauta_admissao);

create table if not exists media_details (
  id uuid primary key default gen_random_uuid(),
  file_name text not null unique,
  alt_text text,
  title text,
  caption text,
  description text,
  updated_at timestamptz not null default now()
);

alter table media_details enable row level security;

drop policy if exists "media_details_public_read" on media_details;
drop policy if exists "media_details_auth_write" on media_details;

create policy "media_details_public_read" on media_details for select using (true);
create policy "media_details_auth_write" on media_details for all to authenticated using (true) with check (true);

