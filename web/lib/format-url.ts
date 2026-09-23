// Shortens a citation URL for display in the chat UI: strips the protocol
// and a leading "www.", keeps host + path. Falls back to the raw string if
// it isn't a valid URL -- filterCitations (lib/llm/citations.ts) already
// guarantees http(s) server-side, but this runs client-side on
// server-provided data, so it stays defensive rather than throwing.
export function formatCitationLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${host}${path}`;
  } catch {
    return url;
  }
}
