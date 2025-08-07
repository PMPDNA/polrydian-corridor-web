-- Harden function by setting explicit search_path
create or replace function public.html_entity_decode(input text)
returns text
language plpgsql
immutable
set search_path = 'pg_catalog', 'public'
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