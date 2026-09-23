import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { answerChatMessage, ChatError } from "./chat";

const AGENT = { id: "agent-1", slug: "ask-breno", name: "Ask Breno" };

const SEARCH_ROW = {
  chunk_id: "chunk-1",
  body: "Repo: https://github.com/Zbreno11-git/example",
  reference: null,
  chunk_index: 0,
  source_id: "source-1",
  origin: "projects",
  rank: 0.5,
};

// Fakes the two Supabase entry points chat.ts's dependencies use:
// `.from(...).select(...).eq(...).eq(...).maybeSingle()` (agents.ts) and
// `.rpc(...)` (search.ts).
function fakeSupabase(options: { agent?: unknown; searchRows?: unknown[] } = {}) {
  const { agent = AGENT, searchRows = [SEARCH_ROW] } = options;

  const agentChain = {
    select: vi.fn(() => agentChain),
    eq: vi.fn(() => agentChain),
    maybeSingle: vi.fn(() => Promise.resolve({ data: agent, error: null })),
  };
  const from = vi.fn(() => agentChain);
  const rpc = vi.fn(() => Promise.resolve({ data: searchRows, error: null }));

  return { from, rpc } as unknown as SupabaseClient;
}

describe("answerChatMessage", () => {
  it("rejects an empty message before touching the database", async () => {
    const supabase = fakeSupabase();
    const generateAnswer = vi.fn();

    await expect(answerChatMessage(supabase, "ask-breno", "   ", generateAnswer)).rejects.toThrow(ChatError);
    expect(supabase.from).not.toHaveBeenCalled();
    expect(generateAnswer).not.toHaveBeenCalled();
  });

  it("rejects a message over the length limit", async () => {
    const supabase = fakeSupabase();
    const longMessage = "a".repeat(1001);

    await expect(answerChatMessage(supabase, "ask-breno", longMessage, vi.fn())).rejects.toThrow(
      "at most 1000 characters"
    );
  });

  it("throws a 404 ChatError when the agent isn't found or isn't published", async () => {
    const supabase = fakeSupabase({ agent: null });
    const generateAnswer = vi.fn();

    const error = await answerChatMessage(supabase, "missing-agent", "hi", generateAnswer).catch((e) => e);

    expect(error).toBeInstanceOf(ChatError);
    expect(error.status).toBe(404);
    expect(generateAnswer).not.toHaveBeenCalled();
  });

  it("calls generateAnswer with the trimmed message and retrieved chunks", async () => {
    const supabase = fakeSupabase();
    const generateAnswer = vi.fn().mockResolvedValue({ answer: "Hi", citations: [] });

    await answerChatMessage(supabase, "ask-breno", "  What does Breno do?  ", generateAnswer);

    expect(generateAnswer).toHaveBeenCalledWith(
      "What does Breno do?",
      expect.arrayContaining([expect.objectContaining({ origin: "projects" })])
    );
  });

  it("keeps citations grounded in the retrieved chunks and drops the rest", async () => {
    const supabase = fakeSupabase();
    const generateAnswer = vi.fn().mockResolvedValue({
      answer: "Here's the repo.",
      citations: [
        "https://github.com/Zbreno11-git/example", // present in SEARCH_ROW.body
        "https://github.com/Zbreno11-git/hallucinated", // not present anywhere
      ],
    });

    const result = await answerChatMessage(supabase, "ask-breno", "Where's the repo?", generateAnswer);

    expect(result).toEqual({
      answer: "Here's the repo.",
      citations: ["https://github.com/Zbreno11-git/example"],
    });
  });

  it("still calls the model (to produce a localized 'no answer') when no chunks are retrieved", async () => {
    const supabase = fakeSupabase({ searchRows: [] });
    const generateAnswer = vi.fn().mockResolvedValue({ answer: "I don't have that information.", citations: [] });

    const result = await answerChatMessage(supabase, "ask-breno", "Unrelated question", generateAnswer);

    expect(generateAnswer).toHaveBeenCalledWith("Unrelated question", []);
    expect(result).toEqual({ answer: "I don't have that information.", citations: [] });
  });
});
