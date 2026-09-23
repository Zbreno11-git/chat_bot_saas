import type { SupabaseClient } from "@supabase/supabase-js";

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
// (see web/supabase/migrations/20260923200121_add-knowledge-chunks-search.sql).
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

// Ranked full-text search over one agent's knowledge_chunks. `supabase` must
// be a server-side client using the secret key (see lib/supabase-admin.ts) --
// this scopes to `agentId`, but relies on the caller to have already
// resolved the right agent, same as the rest of the answer flow in
// CLAUDE.md's architecture rules.
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
    p_limit: limit,
  });

  if (error) throw error;

  return mapSearchRows(data ?? []);
}
