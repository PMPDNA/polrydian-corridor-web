-- Re-run with corrected pg_policies column name (policyname)
create table if not exists public.articles_backup_20250807 as table public.articles;

alter table public.articles_backup_20250807 enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'articles_backup_20250807' and policyname = 'deny_all_select_on_articles_backup_20250807'
  ) then
    create policy "deny_all_select_on_articles_backup_20250807"
      on public.articles_backup_20250807
      for select using (false);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'articles_backup_20250807' and policyname = 'deny_all_insert_on_articles_backup_20250807'
  ) then
    create policy "deny_all_insert_on_articles_backup_20250807"
      on public.articles_backup_20250807
      for insert with check (false);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'articles_backup_20250807' and policyname = 'deny_all_update_on_articles_backup_20250807'
  ) then
    create policy "deny_all_update_on_articles_backup_20250807"
      on public.articles_backup_20250807
      for update using (false);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'articles_backup_20250807' and policyname = 'deny_all_delete_on_articles_backup_20250807'
  ) then
    create policy "deny_all_delete_on_articles_backup_20250807"
      on public.articles_backup_20250807
      for delete using (false);
  end if;
end$$;

create or replace function public.html_entity_decode(input text)
returns text
language plpgsql
immutable
as $$
declare
  s text;
begin
  s := coalesce(input, '');
  s := replace(s, '&amp;', '&');
  s := replace(s, '&lt;', '<');
  s := replace(s, '&gt;', '>');
  s := replace(s, '&quot;', '"');
  s := replace(s, '&#34;', '"');
  s := replace(s, '&#39;', '''');
  s := replace(s, '&apos;', '''');
  s := replace(s, '&nbsp;', ' ');
  return s;
end
$$;

update public.articles set content = public.html_entity_decode(content);
update public.articles set summary = public.html_entity_decode(summary) where summary is not null;
update public.articles set content = regexp_replace(content, '(?is)<(script|style)[^>]*>.*?</\\1>', '', 'g');
update public.articles set content = btrim(content);
