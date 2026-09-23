import type { SupabaseClient } from "@supabase/supabase-js";
import { rerank } from "./rerank";

export type SearchResult = {
  chunkId: string;
  body: string;
  reference: string | null;
  chunkIndex: number;
  sourceId: string;
  origin: string;
  rank: number;
};

// Shape of a row returned by the search_knowledge_chunks Postgres function
// (see web/supabase/migrations/20260923200121_add-knowledge-chunks-search.sql
// and .../20260923215202_or_match_knowledge_chunks_search.sql, which changed
// its matching semantics but not this row shape).
type SearchKnowledgeChunksRow = {
  chunk_id: string;
  body: string;
  reference: string | null;
  chunk_index: number;
  source_id: string;
  origin: string;
  rank: number;
};

export function mapSearchRows(rows: SearchKnowledgeChunksRow[]): SearchResult[] {
  return rows.map((row) => ({
    chunkId: row.chunk_id,
    body: row.body,
    reference: row.reference,
    chunkIndex: row.chunk_index,
    sourceId: row.source_id,
    origin: row.origin,
    rank: row.rank,
  }));
}

// How many candidates to pull from Postgres before re-ranking in JS (see
// rerank.ts). Generous on purpose: at this project's content scale (dozens
// of chunks, not thousands), fetching most/all of what matches at all and
// re-ranking precisely in application code is cheap and far more accurate
// than relying on Postgres's un-weighted ts_rank alone. Revisit if the
// knowledge base grows enough for this to matter for latency or cost.
const CANDIDATE_POOL_SIZE = 50;

// Ranked full-text search over one agent's knowledge_chunks. `supabase` must
// be a server-side client using the secret key (see lib/supabase-admin.ts) --
// this scopes to `agentId`, but relies on the caller to have already
// resolved the right agent, same as the rest of the answer flow in
// CLAUDE.md's architecture rules.
//
// Two stages: Postgres does recall (any chunk sharing at least one query
// word, see the OR-matching migration), then rerank() does the actual
// relevance ranking in JS, where it's easy to test with fixtures instead of
// tuning SQL blind. `limit` bounds the final result, not the DB query.
export async function searchKnowledgeChunks(
  supabase: SupabaseClient,
  agentId: string,
  query: string,
  limit = 5
): Promise<SearchResult[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    throw new Error("searchKnowledgeChunks: query must not be empty");
  }

  const { data, error } = await supabase.rpc("search_knowledge_chunks", {
    p_agent_id: agentId,
    p_query: trimmedQuery,
    p_limit: Math.max(limit, CANDIDATE_POOL_SIZE),
  });

  if (error) throw error;

  const candidates = mapSearchRows(data ?? []);
  return rerank(trimmedQuery, candidates, limit);
}
