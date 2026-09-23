-- ts_rank's default (normalization = 0) ignores document length, so a short,
-- dense chunk can outrank a longer chunk that's actually more on-topic just
-- because the query terms are a bigger fraction of its (shorter) text.
-- Manual testing against the real content showed exactly this: a query for
-- "XGBoost churn" ranked the bio summary paragraph (which just lists
-- XGBoost among many skills) slightly above the dedicated churn-analysis
-- project section. Normalization 32 (rank / (rank + 1)) divides down chunks
-- with high raw density without zeroing out short chunks entirely, which a
-- straight document-length division (normalization 2) can do.
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
        ts_rank(c.search_vector, websearch_to_tsquery('simple', p_query), 32) AS rank
    FROM public.knowledge_chunks c
    JOIN public.knowledge_sources s ON s.id = c.source_id
    WHERE c.agent_id = p_agent_id
        AND c.search_vector @@ websearch_to_tsquery('simple', p_query)
    ORDER BY rank DESC
    LIMIT p_limit;
$$;
