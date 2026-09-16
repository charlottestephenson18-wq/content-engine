-- Foundation schema: projects, documents, document_chunks (RAG index).

create extension if not exists vector;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uploaded files. project_id null = general/account-wide context.
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  status text not null default 'pending'
    check (status in ('pending', 'chunking', 'embedded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RAG index. user_id/project_id are denormalized from documents to keep
-- RLS policies here simple (no join needed to enforce isolation).
create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  chunk_text text not null,
  embedding vector(384),
  chunk_index int not null,
  created_at timestamptz not null default now()
);

create index document_chunks_embedding_idx on public.document_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index document_chunks_user_id_idx on public.document_chunks (user_id);
create index document_chunks_project_id_idx on public.document_chunks (project_id);
create index documents_user_id_idx on public.documents (user_id);
create index documents_project_id_idx on public.documents (project_id);
create index projects_user_id_idx on public.projects (user_id);
