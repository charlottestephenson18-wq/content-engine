-- Similarity search RPC used by the retrieval endpoint.
--
-- match_user_id MUST always be supplied by server-side code from the
-- authenticated session — never trust a client-supplied user_id, since
-- that would defeat per-user isolation regardless of RLS on the base table.
create or replace function public.match_document_chunks(
  query_embedding vector(384),
  match_user_id uuid,
  match_project_id uuid default null,
  match_general_only boolean default false,
  match_count int default 8
)
returns table (
  id uuid,
  document_id uuid,
  chunk_text text,
  similarity float
)
language sql stable
security definer
set search_path = public
as $$
  select
    dc.id,
    dc.document_id,
    dc.chunk_text,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where dc.user_id = match_user_id
    and (
      (match_general_only and dc.project_id is null)
      or (not match_general_only and match_project_id is null and dc.project_id is null)
      or (not match_general_only and match_project_id is not null
          and (dc.project_id = match_project_id or dc.project_id is null))
    )
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

revoke all on function public.match_document_chunks from public;
grant execute on function public.match_document_chunks to authenticated;
