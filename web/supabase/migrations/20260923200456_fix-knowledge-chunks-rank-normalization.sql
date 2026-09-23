-- The previous migration's normalization value (32) was wrong for the
-- problem it was meant to fix: 32 only rescales the raw rank into 0-1
-- (rank / (rank + 1)), it does not divide by document length at all, so it
-- preserves the same ordering. Normalization 2 (divide by document length,
-- in lexemes) is the one that actually corrects for a short, dense chunk
-- outranking a longer, more topically relevant one.
CREATE OR REPLACE FUNCTION search_knowledge_chunks(
    p_agent_id uuid,
    p_query text,
    p_limit integer DEFAULT 5
)
RETURNS TABLE (
    chunk_id uuid,
    body text,
    reference text,
    chunk_index integer,
    source_id uuid,
    origin text,
    rank real
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT
        c.id AS chunk_id,
        c.body,
        c.reference,
        c.chunk_index,
        c.source_id,
        s.origin,
        ts_rank(c.search_vector, websearch_to_tsquery('simple', p_query), 2) AS rank
    FROM public.knowledge_chunks c
    JOIN public.knowledge_sources s ON s.id = c.source_id
    WHERE c.agent_id = p_agent_id
        AND c.search_vector @@ websearch_to_tsquery('simple', p_query)
    ORDER BY rank DESC
    LIMIT p_limit;
$$;
