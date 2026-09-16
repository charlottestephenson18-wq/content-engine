-- Row Level Security: every table is scoped to auth.uid() = user_id, so
-- isolation between users is enforced by Postgres itself.

alter table public.projects enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;

create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id);
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);
create policy "documents_update_own" on public.documents
  for update using (auth.uid() = user_id);
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

create policy "chunks_select_own" on public.document_chunks
  for select using (auth.uid() = user_id);
create policy "chunks_insert_own" on public.document_chunks
  for insert with check (auth.uid() = user_id);
create policy "chunks_delete_own" on public.document_chunks
  for delete using (auth.uid() = user_id);
