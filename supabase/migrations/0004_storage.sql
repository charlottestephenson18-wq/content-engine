-- Private Storage bucket for uploaded documents.
-- Path convention: {user_id}/{project_id_or_'general'}/{uuid}-{filename}

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false);

create policy "storage_select_own" on storage.objects
  for select using (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
  );
