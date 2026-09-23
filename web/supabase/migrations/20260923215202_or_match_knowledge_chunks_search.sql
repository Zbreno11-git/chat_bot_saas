-- Switches search_knowledge_chunks matching from AND-of-all-terms to
-- OR-of-terms.
--
-- Chat questions are natural-language sentences (e.g. "What stack did Breno
-- use for the Smart Store project?"), not keyword queries. Because the
-- 'simple' text search config has no stopword list (a deliberate bilingual
-- choice -- see the previous migration), websearch_to_tsquery's implicit AND
-- required every word, including "what"/"did"/"the", to appear in the same
-- chunk. Verified while building the chat API (step 05): that sentence
-- matched zero chunks, even though a chunk about the Smart Store project
-- exists. A keyword query like "smart store arduino dbt" did match.
--
-- OR-of-terms trades precision for recall: a chunk now matches on any shared
-- word, and ts_rank (which weights by number of matching terms and their
-- positions) sorts the best match to the top. Weak/irrelevant matches are
-- still returned within the LIMIT, but relevance judgment for what actually
-- answers the question is left to the model, which is instructed (see
-- web/lib/llm/prompt.ts) to say so when the retrieved context doesn't.
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
    WITH parsed_query AS (
        SELECT to_tsquery('simple', string_agg(lexeme, ' | ')) AS query
        FROM unnest(tsvector_to_array(to_tsvector('simple', p_query))) AS lexeme
    )
    SELECT
        c.id AS chunk_id,
        c.body,
        c.reference,
        c.chunk_index,
        c.source_id,
        s.origin,
        ts_rank(c.search_vector, parsed_query.query) AS rank
    FROM public.knowledge_chunks c
    JOIN public.knowledge_sources s ON s.id = c.source_id
    CROSS JOIN parsed_query
    WHERE c.agent_id = p_agent_id
        AND c.search_vector @@ parsed_query.query
    ORDER BY rank DESC
    LIMIT p_limit;
$$;
