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
  destaque boolean not null default false,
  created_at timestamptz not null default now()
);

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

alter table noticias enable row level security;
alter table publicacoes enable row level security;
alter table livros enable row level security;
alter table videos enable row level security;
alter table editais enable row level security;
alter table inscricoes enable row level security;
alter table anuncios enable row level security;

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

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('inscricoes', 'inscricoes', false)
on conflict (id) do nothing;

drop policy if exists "esj_media_public_read" on storage.objects;
drop policy if exists "esj_media_auth_write" on storage.objects;
drop policy if exists "esj_media_auth_update" on storage.objects;
drop policy if exists "esj_inscricoes_insert" on storage.objects;
drop policy if exists "esj_inscricoes_auth_read" on storage.objects;

create policy "esj_media_public_read" on storage.objects
  for select using (bucket_id = 'media');
create policy "esj_media_auth_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "esj_media_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'media');
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

insert into livros (title, image, sort_order)
select * from (values
  ('Infovula', '/livro-infovula.jpg', 1),
  ('As Noivas do Homem Maduro', '/livro-noivas.jpg', 2),
  ('Conhecimento que conecta', '/livro-experiencias.jpg', 3)
) as v(title, image, sort_order)
where not exists (select 1 from livros);
