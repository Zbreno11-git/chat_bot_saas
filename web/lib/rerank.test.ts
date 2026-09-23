import { describe, expect, it } from "vitest";
import type { SearchResult } from "./search";
import { rerank } from "./rerank";

function makeChunk(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    chunkId: "chunk-1",
    body: "",
    reference: null,
    chunkIndex: 0,
    sourceId: "source-1",
    origin: "projects",
    rank: 0,
    ...overrides,
  };
}

describe("rerank", () => {
  it("returns [] for an empty candidate list", () => {
    expect(rerank("anything", [], 5)).toEqual([]);
  });

  it("falls back to the original order (sliced) when the query has no words", () => {
    const candidates = [makeChunk({ chunkId: "a" }), makeChunk({ chunkId: "b" })];

    expect(rerank("???", candidates, 5)).toEqual(candidates);
  });

  it("falls back to scoring on stopwords when the whole query is stopwords", () => {
    // Degenerate case: nothing left after dropping scaffolding words. Should
    // still run (scored on the original terms), not silently return
    // unranked candidates.
    const candidates = [
      makeChunk({ chunkId: "a", body: "the a for" }),
      makeChunk({ chunkId: "b", body: "completely unrelated content" }),
    ];

    const result = rerank("what is the for", candidates, 2);

    expect(result).toHaveLength(2);
  });

  it("ranks the one chunk mentioning a rare, on-topic term above chunks that only share common words with the question", () => {
    // Regression case for the actual bug found while smoke-testing this
    // step: verified live against production content that "What stack did
    // Breno use for the Smart Store project?" didn't even put the Smart
    // Store chunk in Postgres's top 10 -- ts_rank weights every matching
    // word equally, so a question's common words ("what", "the", "stack",
    // "project" -- all of which legitimately recur across many chunks
    // about Breno's other projects) drown out the one term that actually
    // identifies the topic ("Smart"/"Store").
    const onTopic = makeChunk({
      chunkId: "smart-store",
      body: "## Smart Store — IoT pipeline. Arduino, Python, PostgreSQL, dbt, SQL, Evidence.",
    });
    // Each distractor shares the question's common words (mirroring how
    // every real project chunk mentions Breno, "the", "stack", "project")
    // but never "smart" or "store".
    const distractors = [
      "## Austin 311 — Analytics Pipeline. Breno used the stack: BigQuery, SQL, Python for this project.",
      "## Telco Churn — Prediction. Breno used the project's stack: Random Forest for this one.",
      "## Wine Quality — ML app. Breno used the stack for this project: XGBoost and SHAP.",
      "## Business Card Scanner — AI tool. Breno used the project's stack: Gemini and Claude.",
      "## Résumé Adapter — Web app. Breno used the stack for this project: Streamlit and pypdf.",
      "## Financial Agent — Automation. Breno used the project's stack: n8n and Gemini.",
      "## Vitality Compass — Health app. Breno used the stack for this project: Flask and React.",
      "## Chinook SQL — EDA project. Breno used the stack for this one: plain SQL only.",
    ].map((body, i) => makeChunk({ chunkId: `distractor-${i}`, body }));

    const result = rerank(
      "What stack did Breno use for the Smart Store project?",
      [...distractors, onTopic],
      3
    );

    expect(result[0].chunkId).toBe("smart-store");
  });

  it("gives a query term appearing in every candidate near-zero discriminating power", () => {
    const candidates = [
      makeChunk({ chunkId: "a", body: "Breno Breno Breno common word only, nothing distinctive here at all." }),
      makeChunk({ chunkId: "b", body: "Breno worked on the Wine Quality Predictor with XGBoost and SHAP." }),
    ];

    // "wine" only appears in chunk b -- it should win despite chunk a
    // repeating the word "Breno" three times.
    const result = rerank("Breno wine", candidates, 2);

    expect(result[0].chunkId).toBe("b");
  });

  it("drops single-character tokens like the stray 's' from a possessive", () => {
    // "Breno's" tokenizes to "breno" + "s". Without filtering, "s" would
    // count as a shared term with any chunk containing another possessive,
    // diluting real relevance signal with noise.
    const candidates = [
      makeChunk({ chunkId: "a", body: "Renato's notes mention nothing about the topic asked." }),
      makeChunk({ chunkId: "b", body: "Breno has hands-on production experience with Python." }),
    ];

    const result = rerank("What is Breno's experience with Python?", candidates, 2);

    expect(result[0].chunkId).toBe("b");
  });

  it("respects the limit", () => {
    const candidates = [
      makeChunk({ chunkId: "a", body: "apple" }),
      makeChunk({ chunkId: "b", body: "apple banana" }),
      makeChunk({ chunkId: "c", body: "apple banana cherry" }),
    ];

    expect(rerank("apple banana cherry", candidates, 1)).toHaveLength(1);
  });

  it("sets rank to the computed score, in descending order", () => {
    const candidates = [
      makeChunk({ chunkId: "a", body: "irrelevant text about nothing in particular" }),
      makeChunk({ chunkId: "b", body: "xylophone" }),
    ];

    const result = rerank("xylophone", candidates, 2);

    expect(result[0].chunkId).toBe("b");
    expect(result[0].rank).toBeGreaterThan(result[1].rank);
  });
});
