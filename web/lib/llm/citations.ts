import type { SearchResult } from "../search";

// Enforces the architecture rule in CLAUDE.md: "check that every citation
// came from the retrieved set". The model is instructed to only cite URLs
// copied verbatim from the context it was given (see prompt.ts), but a
// model can still get this wrong -- by inventing a plausible-looking URL,
// or by citing something real it knows from training data instead of from
// this agent's knowledge base. This is the actual enforcement: any citation
// that isn't a verbatim substring of a retrieved chunk's body is dropped
// silently rather than shown to the visitor.
export function filterCitations(citations: string[], chunks: SearchResult[]): string[] {
  const grounded = citations
    .map((citation) => citation.trim())
    .filter((citation) => citation.length > 0)
    .filter((citation) => chunks.some((chunk) => chunk.body.includes(citation)));

  return [...new Set(grounded)];
}
