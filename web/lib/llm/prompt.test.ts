import { describe, expect, it } from "vitest";
import type { SearchResult } from "../search";
import { buildContextBlock } from "./prompt";

function makeChunk(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    chunkId: "chunk-1",
    body: "Breno works with Python and SQL.",
    reference: null,
    chunkIndex: 0,
    sourceId: "source-1",
    origin: "bio",
    rank: 0.5,
    ...overrides,
  };
}

describe("buildContextBlock", () => {
  it("says explicitly when no chunks were retrieved", () => {
    const block = buildContextBlock([]);

    expect(block).toContain("no matching chunks were found");
  });

  it("numbers chunks and labels each with its origin", () => {
    const block = buildContextBlock([
      makeChunk({ origin: "bio", body: "Chunk one body." }),
      makeChunk({ origin: "projects", body: "Chunk two body." }),
    ]);

    expect(block).toContain("[1] (source: bio)\nChunk one body.");
    expect(block).toContain("[2] (source: projects)\nChunk two body.");
  });

  it("marks the block as untrusted data", () => {
    const block = buildContextBlock([makeChunk()]);

    expect(block).toMatch(/untrusted data/i);
  });
});
