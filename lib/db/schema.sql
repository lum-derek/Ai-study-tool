-- ============================================================
-- AI Study Tool — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Documents: uploaded notes or PDFs
create table if not exists documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  raw_text      text not null,
  file_url      text,                    -- null if plain text upload
  file_type     text not null default 'text', -- 'text' | 'pdf'
  char_count    integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Study results: summary, flashcards, quiz — one row per document
create table if not exists study_results (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references documents(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  summary       text,
  flashcards    jsonb,                   -- [{ front, back }]
  quiz          jsonb,                   -- [{ question, options[], answer, explanation }]
  created_at    timestamptz not null default now()
);

-- Document chunks: for RAG (chat with notes)
create table if not exists document_chunks (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references documents(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  content       text not null,
  chunk_index   integer not null,
  created_at    timestamptz not null default now()
);

-- Video recommendations: YouTube results per document
create table if not exists video_recommendations (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid not null references documents(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  video_id        text not null,
  title           text not null,
  channel         text not null,
  thumbnail_url   text not null,
  youtube_url     text not null,
  duration        text,
  view_count      integer,
  ai_summary      text,
  relevance_score float,
  created_at      timestamptz not null default now()
);

-- Quiz attempts: progress tracking per document
create table if not exists quiz_attempts (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references documents(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  score         integer not null,        -- number of correct answers
  total         integer not null,        -- total questions
  created_at    timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists documents_user_id_idx on documents(user_id);
create index if not exists study_results_document_id_idx on study_results(document_id);
create index if not exists document_chunks_document_id_idx on document_chunks(document_id);
create index if not exists video_recommendations_document_id_idx on video_recommendations(document_id);
create index if not exists quiz_attempts_document_id_idx on quiz_attempts(document_id);
create index if not exists quiz_attempts_user_id_idx on quiz_attempts(user_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table documents enable row level security;
alter table study_results enable row level security;
alter table document_chunks enable row level security;
alter table video_recommendations enable row level security;
alter table quiz_attempts enable row level security;

-- Documents: users can only access their own
create policy "users can manage their own documents"
  on documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Study results
create policy "users can manage their own study results"
  on study_results for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Document chunks
create policy "users can manage their own chunks"
  on document_chunks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Video recommendations
create policy "users can manage their own video recommendations"
  on video_recommendations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Quiz attempts
create policy "users can manage their own quiz attempts"
  on quiz_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
