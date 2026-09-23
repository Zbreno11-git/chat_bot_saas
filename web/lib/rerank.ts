import type { SearchResult } from "./search";

// Small, hand-picked list of PT/EN function words, used only to filter the
// *query* before scoring (candidate bodies are still tokenized and scored
// in full). Deliberately separate from the Postgres side: the 'simple' text
// search config keeps its no-stopword recall pass (see the OR-matching
// migration -- still needed so this fine-grained JS layer has candidates to
// rank in the first place). This list only matters for a much narrower
// job: a question's scaffolding words ("what", "is", "with", "qual", "é")
// shouldn't compete on equal footing with its actual content words. Without
// it, a short question like "What is Breno's experience with Python?" can
// rank a chunk that matches several scaffolding words above the one chunk
// that actually lists Python as a skill -- verified against production
// content while building this step.
const QUERY_STOPWORDS = new Set([
  "what", "is", "are", "was", "were", "the", "a", "an", "for", "with", "did", "do", "does",
  "of", "to", "in", "on", "and", "or", "that", "this", "it", "you", "your", "me", "my",
  "qual", "quais", "quem", "como", "onde", "quando", "por", "que", "é", "foi", "são",
  "o", "os", "as", "um", "uma", "de", "do", "da", "dos", "das", "para", "com", "em", "no", "na",
]);

// Rough word tokenizer: lowercase, split on runs of letters/digits (any
// script), drop single-character tokens. Doesn't need to match Postgres's
// 'simple' tokenizer exactly -- it only has to be consistent with itself,
// since it tokenizes both the query and the already-fetched candidate
// bodies here in JS. The length filter matters more than it looks: an
// apostrophe ("Breno's") splits into "breno" and a bare "s", and that "s"
// is noise -- it says nothing about relevance but still accumulates a
// score contribution for every possessive in the corpus.
function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((token) => token.length > 1);
}

// Re-ranks candidates already fetched from Postgres (search_knowledge_chunks,
// which does the recall pass -- any chunk sharing at least one query word)
// and returns the top `limit`.
//
// Why this exists: Postgres's ts_rank weights every matching word equally.
// For a natural-language question, common words ("what", "the", "project")
// occur in almost every chunk and can outweigh the one or two words that
// actually identify what's being asked about ("Smart Store"). Verified
// against production content: the chunk about the Smart Store project
// didn't even make the top 10 for "What stack did Breno use for the Smart
// Store project?", despite being the only chunk that mentions "Smart" or
// "Store" at all.
//
// This re-scores with a small TF-IDF: a query word that appears in few
// candidates (rare, specific -- "Smart") counts for much more than one
// that appears in most of them (common -- "the", "project"). Document
// frequency is computed from the candidate pool itself rather than a
// separate corpus-wide query -- fine at this project's scale, where the
// recall pass already returns most of the agent's chunks for an
// ordinary-length question (see search.ts's candidate pool size).
export function rerank(query: string, candidates: SearchResult[], limit: number): SearchResult[] {
  if (candidates.length === 0) return [];

  const allQueryTerms = [...new Set(tokenize(query))];
  if (allQueryTerms.length === 0) return candidates.slice(0, limit);

  // Prefer content words over scaffolding words, but don't end up with
  // nothing to score on if the whole query happens to be stopwords.
  const contentTerms = allQueryTerms.filter((term) => !QUERY_STOPWORDS.has(term));
  const queryTerms = contentTerms.length > 0 ? contentTerms : allQueryTerms;

  const candidateTokens = candidates.map((candidate) => tokenize(candidate.body));

  // Document frequency: how many candidates contain each query term at all.
  const documentFrequency = new Map<string, number>();
  for (const term of queryTerms) {
    const count = candidateTokens.filter((tokens) => tokens.includes(term)).length;
    documentFrequency.set(term, count);
  }

  const scored = candidates.map((candidate, index) => {
    const tokens = candidateTokens[index];
    if (tokens.length === 0) return { candidate, score: 0 };

    const termFrequency = new Map<string, number>();
    for (const token of tokens) {
      termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1);
    }

    let score = 0;
    for (const term of queryTerms) {
      const tf = termFrequency.get(term) ?? 0;
      if (tf === 0) continue;

      // Smoothed idf: always positive, and a term in every candidate still
      // contributes a small amount rather than zeroing out.
      const df = documentFrequency.get(term) ?? 0;
      const idf = Math.log((candidates.length + 1) / (df + 1)) + 1;

      // Log-scaled term frequency, not raw count: repeating a word 3 times
      // shouldn't count 3x as much as a single occurrence of a rarer word
      // (classic TF-IDF diminishing-returns weighting -- otherwise a chunk
      // that just happens to repeat a common word several times can still
      // out-score one that contains the actual rare, on-topic word once).
      score += (1 + Math.log(tf)) * idf;
    }

    // Length-normalize so a long chunk doesn't win purely by containing
    // more words overall (and so more incidental term matches).
    return { candidate, score: score / Math.sqrt(tokens.length) };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ candidate, score }) => ({ ...candidate, rank: score }));
}
