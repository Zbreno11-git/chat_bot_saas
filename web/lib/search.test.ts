import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
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
});
