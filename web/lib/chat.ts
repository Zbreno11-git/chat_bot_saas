import type { SupabaseClient } from "@supabase/supabase-js";
import { resolvePublishedAgent } from "./agents";
import { filterCitations } from "./llm/citations";
import { createGeminiProvider, type GenerateAnswer } from "./llm/gemini";
import { searchKnowledgeChunks } from "./search";

// Generous enough for a real question, tight enough to bound per-request
// token cost. Full rate limiting and the hard spending cap are step 07
// (CLAUDE.md: "Limits, Metrics & Eval Harness") -- this is just a basic
// input guard so step 05 doesn't ship with no bound at all.
const MAX_MESSAGE_LENGTH = 1000;
const CHUNKS_PER_QUERY = 5;

export type ChatAnswer = {
  answer: string;
  citations: string[];
};

// Thrown for problems the caller (the API route) should map to a specific
// HTTP status, as opposed to unexpected errors (DB/LLM failures) that
// should surface as a generic 500.
export class ChatError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ChatError";
    this.status = status;
  }
}

// The full answer flow from CLAUDE.md's architecture rules: resolve agent,
// retrieve chunks for that agent, call the model, check that every citation
// came from the retrieved set, return text and links. (Limits and metrics
// recording are step 07.)
export async function answerChatMessage(
  supabase: SupabaseClient,
  agentSlug: string,
  message: string,
  generateAnswer: GenerateAnswer = createGeminiProvider()
): Promise<ChatAnswer> {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new ChatError("message must not be empty", 400);
  }
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new ChatError(`message must be at most ${MAX_MESSAGE_LENGTH} characters`, 400);
  }

  const agent = await resolvePublishedAgent(supabase, agentSlug);
  if (!agent) {
    throw new ChatError("agent not found", 404);
  }

  const chunks = await searchKnowledgeChunks(supabase, agent.id, trimmedMessage, CHUNKS_PER_QUERY);
  const { answer, citations } = await generateAnswer(trimmedMessage, chunks);

  return { answer, citations: filterCitations(citations, chunks) };
}
