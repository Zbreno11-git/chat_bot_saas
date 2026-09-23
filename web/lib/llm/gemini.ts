import { GoogleGenAI, Type } from "@google/genai";
import type { SearchResult } from "../search";
import { buildContextBlock, SYSTEM_INSTRUCTIONS } from "./prompt";

export type ChatCompletion = {
  answer: string;
  citations: string[];
};

// Provider adapter type (CLAUDE.md: "AI: Gemini, behind a provider adapter
// (swappable)"). Anything calling the model -- lib/chat.ts, tests -- depends
// on this signature, not on @google/genai directly, so a future provider
// swap only touches this file.
export type GenerateAnswer = (message: string, chunks: SearchResult[]) => Promise<ChatCompletion>;

// Cheap, fast model -- fits the ~R$50/month budget cap in CLAUDE.md.
// Override with GEMINI_MODEL if evals call for a stronger model later.
const DEFAULT_MODEL = "gemini-2.5-flash";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: { type: Type.STRING },
    citations: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["answer", "citations"],
};

function isChatCompletion(value: unknown): value is ChatCompletion {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.answer === "string" &&
    Array.isArray(candidate.citations) &&
    candidate.citations.every((citation) => typeof citation === "string")
  );
}

// Reads GEMINI_API_KEY lazily (at call time, not at module load) so tests
// never need a real key just to import this module.
export function createGeminiProvider(): GenerateAnswer {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const client = new GoogleGenAI({ apiKey });

  return async function generateAnswer(message, chunks) {
    const response = await client.models.generateContent({
      model,
      contents: `${buildContextBlock(chunks)}\n\nVisitor question:\n${message}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Gemini returned a response that wasn't valid JSON");
    }

    if (!isChatCompletion(parsed)) {
      throw new Error("Gemini returned a response that didn't match the expected shape");
    }

    return parsed;
  };
}
