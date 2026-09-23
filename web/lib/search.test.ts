import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { mapSearchRows, searchKnowledgeChunks } from "./search";

describe("mapSearchRows", () => {
  it("converts snake_case RPC rows to camelCase SearchResults", () => {
    const rows = [
      {
        chunk_id: "chunk-1",
        body: "Breno works with Python and SQL.",
        reference: "https://example.com/cv",
        chunk_index: 0,
        source_id: "source-1",
        origin: "bio",
        rank: 0.607927,
      },
    ];

    expect(mapSearchRows(rows)).toEqual([
      {
        chunkId: "chunk-1",
        body: "Breno works with Python and SQL.",
        reference: "https://example.com/cv",
        chunkIndex: 0,
        sourceId: "source-1",
        origin: "bio",
        rank: 0.607927,
      },
    ]);
  });

  it("passes through a null reference", () => {
    const rows = [
      {
        chunk_id: "chunk-1",
        body: "No citation link for this chunk.",
        reference: null,
        chunk_index: 2,
        source_id: "source-1",
        origin: "projects",
        rank: 0.1,
      },
    ];

    expect(mapSearchRows(rows)[0].reference).toBeNull();
  });
});

describe("searchKnowledgeChunks", () => {
  it("rejects an empty query before calling the database", async () => {
    // The client is never used: validation happens before the RPC call.
    const fakeClient = {} as SupabaseClient;

    await expect(searchKnowledgeChunks(fakeClient, "agent-1", "   ")).rejects.toThrow(
      "query must not be empty"
    );
  });

  it("requests a candidate pool larger than the requested limit", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    const fakeClient = { rpc } as unknown as SupabaseClient;

    await searchKnowledgeChunks(fakeClient, "agent-1", "smart store", 5);

    expect(rpc).toHaveBeenCalledWith(
      "search_knowledge_chunks",
      expect.objectContaining({ p_agent_id: "agent-1", p_query: "smart store" })
    );
    const [, params] = rpc.mock.calls[0];
    expect(params.p_limit).toBeGreaterThan(5);
  });

  it("re-ranks the raw DB rows instead of trusting Postgres's row order", async () => {
    // Postgres orders "distractor" first (more raw term matches), but
    // "on-topic" is the only chunk that mentions the rare query word
    // ("xylophone") -- rerank() should put it first regardless of the
    // order the fake RPC returns.
    const rows = [
      {
        chunk_id: "distractor",
        body: "the the the the the the the the the the the the",
        reference: null,
        chunk_index: 0,
        source_id: "source-1",
        origin: "projects",
        rank: 0.9,
      },
      {
        chunk_id: "on-topic",
        body: "xylophone",
        reference: null,
        chunk_index: 1,
        source_id: "source-2",
        origin: "projects",
        rank: 0.1,
      },
    ];
    const rpc = vi.fn().mockResolvedValue({ data: rows, error: null });
    const fakeClient = { rpc } as unknown as SupabaseClient;

    const result = await searchKnowledgeChunks(fakeClient, "agent-1", "the xylophone", 2);

    expect(result[0].chunkId).toBe("on-topic");
  });

  it("throws when the RPC errors", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: new Error("db down") });
    const fakeClient = { rpc } as unknown as SupabaseClient;

    await expect(searchKnowledgeChunks(fakeClient, "agent-1", "hi")).rejects.toThrow("db down");
  });
});
