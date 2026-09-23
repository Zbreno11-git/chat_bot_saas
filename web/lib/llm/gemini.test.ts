import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SearchResult } from "../search";

const generateContentMock = vi.fn();

vi.mock("@google/genai", () => ({
  // A regular function, not an arrow function: vi.fn() calls this via `new`,
  // and only a regular function can serve as a constructor. Returning an
  // object from it makes `new GoogleGenAI(...)` yield that object.
  GoogleGenAI: vi.fn().mockImplementation(function GoogleGenAIMock() {
    return { models: { generateContent: generateContentMock } };
  }),
  Type: {
    OBJECT: "OBJECT",
    STRING: "STRING",
    ARRAY: "ARRAY",
  },
}));

// Imported after the mock so the module under test picks up the mocked SDK.
const { createGeminiProvider } = await import("./gemini");
const { GoogleGenAI } = await import("@google/genai");

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

describe("createGeminiProvider", () => {
  const originalApiKey = process.env.GEMINI_API_KEY;
  const originalModel = process.env.GEMINI_MODEL;

  beforeEach(() => {
    generateContentMock.mockReset();
    vi.mocked(GoogleGenAI).mockClear();
    process.env.GEMINI_API_KEY = "test-key";
    delete process.env.GEMINI_MODEL;
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalApiKey;
    process.env.GEMINI_MODEL = originalModel;
  });

  it("throws when GEMINI_API_KEY is missing, without touching the SDK", () => {
    delete process.env.GEMINI_API_KEY;

    expect(() => createGeminiProvider()).toThrow("Missing GEMINI_API_KEY");
    expect(GoogleGenAI).not.toHaveBeenCalled();
  });

  it("calls the model with the default model name, system instructions and a JSON schema", async () => {
    generateContentMock.mockResolvedValue({ text: '{"answer": "Hi", "citations": []}' });

    const generateAnswer = createGeminiProvider();
    await generateAnswer("What does Breno do?", [makeChunk()]);

    expect(generateContentMock).toHaveBeenCalledTimes(1);
    const call = generateContentMock.mock.calls[0][0];

    expect(call.model).toBe("gemini-2.5-flash");
    expect(call.contents).toContain("Breno works with Python and SQL.");
    expect(call.contents).toContain("What does Breno do?");
    expect(call.config.systemInstruction).toMatch(/Ask Breno/);
    expect(call.config.responseMimeType).toBe("application/json");
    expect(call.config.responseSchema).toMatchObject({ required: ["answer", "citations"] });
  });

  it("uses GEMINI_MODEL when set", async () => {
    process.env.GEMINI_MODEL = "gemini-3-flash";
    generateContentMock.mockResolvedValue({ text: '{"answer": "Hi", "citations": []}' });

    const generateAnswer = createGeminiProvider();
    await generateAnswer("hi", []);

    expect(generateContentMock.mock.calls[0][0].model).toBe("gemini-3-flash");
  });

  it("parses a well-formed JSON response", async () => {
    generateContentMock.mockResolvedValue({
      text: '{"answer": "Breno works with data and AI.", "citations": ["https://example.com/cv"]}',
    });

    const generateAnswer = createGeminiProvider();
    const result = await generateAnswer("What does Breno do?", [makeChunk()]);

    expect(result).toEqual({
      answer: "Breno works with data and AI.",
      citations: ["https://example.com/cv"],
    });
  });

  it("throws when Gemini returns an empty response", async () => {
    generateContentMock.mockResolvedValue({ text: undefined });

    const generateAnswer = createGeminiProvider();

    await expect(generateAnswer("hi", [])).rejects.toThrow("empty response");
  });

  it("throws when Gemini returns text that isn't valid JSON", async () => {
    generateContentMock.mockResolvedValue({ text: "not json" });

    const generateAnswer = createGeminiProvider();

    await expect(generateAnswer("hi", [])).rejects.toThrow("wasn't valid JSON");
  });

  it("throws when the parsed JSON doesn't match the expected shape", async () => {
    generateContentMock.mockResolvedValue({ text: '{"answer": "Hi"}' });

    const generateAnswer = createGeminiProvider();

    await expect(generateAnswer("hi", [])).rejects.toThrow("didn't match the expected shape");
  });

  it("throws when citations contains a non-string", async () => {
    generateContentMock.mockResolvedValue({ text: '{"answer": "Hi", "citations": [1]}' });

    const generateAnswer = createGeminiProvider();

    await expect(generateAnswer("hi", [])).rejects.toThrow("didn't match the expected shape");
  });
});
