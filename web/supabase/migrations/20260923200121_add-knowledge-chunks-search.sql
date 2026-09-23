-- Full-text search over knowledge_chunks.body.
--
-- Uses the 'simple' text search config (no stemming) rather than 'english',
-- because content is bilingual (Portuguese and English) and a single
-- language-specific config would mis-stem whichever language it doesn't
-- match. Matches the stack decision in CLAUDE.md: text search first,
-- pgvector only if evals show worse retrieval.
ALTER TABLE knowledge_chunks
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (to_tsvector('simple', body)) STORED;

CREATE INDEX idx_knowledge_chunks_search_vector
    ON knowledge_chunks USING gin (search_vector);

-- Ranked retrieval for one agent. Always called with the Supabase secret
-- key (server-side only, bypasses RLS) -- see web/lib/search.ts -- so this
-- is SECURITY INVOKER (the default) rather than DEFINER, and search_path is
-- pinned to avoid relying on the caller's search_path.
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
        ts_rank(c.search_vector, websearch_to_tsquery('simple', p_query)) AS rank
    FROM public.knowledge_chunks c
    JOIN public.knowledge_sources s ON s.id = c.source_id
    WHERE c.agent_id = p_agent_id
        AND c.search_vector @@ websearch_to_tsquery('simple', p_query)
    ORDER BY rank DESC
    LIMIT p_limit;
$$;
