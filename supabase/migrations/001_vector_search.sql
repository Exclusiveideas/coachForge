-- Enable the pgvector extension
create extension if not exists vector;

-- Create the similarity search function
create or replace function match_knowledge_chunks(
  query_embedding vector(1536),
  match_coach_id text,
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ckc.id,
    ckc.content,
    1 - (ckc.embedding <=> query_embedding) as similarity
  from coach_knowledge_chunks ckc
  where ckc."coachId" = match_coach_id
    and ckc.embedding is not null
    and 1 - (ckc.embedding <=> query_embedding) > match_threshold
  order by ckc.embedding <=> query_embedding
  limit match_count;
end;
$$;
