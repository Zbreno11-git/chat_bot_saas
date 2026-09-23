import { describe, expect, it } from "vitest";
import type { SearchResult } from "../search";
import { filterCitations } from "./citations";

function makeChunk(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    chunkId: "chunk-1",
    body: "See the repo: https://github.com/Zbreno11-git/example",
    reference: null,
    chunkIndex: 0,
    sourceId: "source-1",
    origin: "projects",
    rank: 0.5,
    ...overrides,
  };
}

describe("filterCitations", () => {
  it("keeps a citation that appears verbatim in a retrieved chunk", () => {
    const chunks = [makeChunk()];

    const result = filterCitations(["https://github.com/Zbreno11-git/example"], chunks);

    expect(result).toEqual(["https://github.com/Zbreno11-git/example"]);
  });

  it("drops a citation not present in any retrieved chunk (hallucinated or off-topic)", () => {
    const chunks = [makeChunk()];

    const result = filterCitations(["https://github.com/Zbreno11-git/not-retrieved"], chunks);

    expect(result).toEqual([]);
  });

  it("drops a citation that is only a real URL known from training data, not from this retrieval", () => {
    // Regression guard for the exact failure mode the rule defends against:
    // a real, correctly-formatted URL that simply wasn't in the context.
    const chunks = [makeChunk({ body: "Unrelated chunk about Breno's bio, no links here." })];

    const result = filterCitations(["https://linkedin.com/in/breno"], chunks);

    expect(result).toEqual([]);
  });

  it("dedupes repeated citations", () => {
    const chunks = [makeChunk()];
    const url = "https://github.com/Zbreno11-git/example";

    const result = filterCitations([url, url], chunks);

    expect(result).toEqual([url]);
  });

  it("drops blank citations", () => {
    const chunks = [makeChunk()];

    const result = filterCitations(["   ", ""], chunks);

    expect(result).toEqual([]);
  });

  it("drops a citation that isn't a URL, even if it's a substring of a chunk body", () => {
    // Regression guard: observed the model citing "projects" (the chunk's
    // origin label) instead of the repo URL in that same chunk. "projects"
    // trivially passes a plain substring check against a chunk whose body
    // mentions "## Projects" or the word "project", so it isn't a link and
    // must never reach the visitor as a citation.
    const chunks = [makeChunk({ body: "## Projects\n\nSmart Store project. Repo: https://github.com/Zbreno11-git/example" })];

    const result = filterCitations(["projects", "CV §3.3"], chunks);

    expect(result).toEqual([]);
  });

  it("returns an empty array when there are no chunks to ground against", () => {
    const result = filterCitations(["https://github.com/Zbreno11-git/example"], []);

    expect(result).toEqual([]);
  });

  it("returns an empty array when there are no citations", () => {
    const result = filterCitations([], [makeChunk()]);

    expect(result).toEqual([]);
  });
});
