-- ESJ — contagem real de visualizações por notícia, para a secção
-- "Notícias mais lidas" reflectir dados verdadeiros em vez de uma lista
-- arbitrária (por data). Colar no SQL Editor do Supabase.

alter table noticias add column if not exists views integer not null default 0;

create or replace function incrementar_visualizacao_noticia(noticia_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update noticias set views = views + 1 where slug = noticia_slug;
$$;

grant execute on function incrementar_visualizacao_noticia(text) to anon, authenticated;
