import type { SearchResult } from "../search";

// Only http(s) URLs count as citations. Guards against the model citing a
// non-URL label instead -- observed while smoke-testing this step: asked
// for the Smart Store project's stack, the model answered correctly but
// put "projects" (the chunk's origin label) in "citations" instead of the
// repo URL that was right there in the same chunk. "projects" is a
// substring of plenty of chunk bodies (any that mention "## Projects" or
// the word "project"), so without this check it would have passed the
// grounding filter below and been shown to visitors as if it were a link.
const URL_PATTERN = /^https?:\/\//i;

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
    .filter((citation) => URL_PATTERN.test(citation))
    .filter((citation) => chunks.some((chunk) => chunk.body.includes(citation)));

  return [...new Set(grounded)];
}
