import { beforeEach, describe, expect, it, vi } from "vitest";

const answerChatMessageMock = vi.fn();
const createAdminClientMock = vi.fn(() => ({ fakeClient: true }));

vi.mock("../../../lib/chat", async () => {
  const actual = await vi.importActual<typeof import("../../../lib/chat")>("../../../lib/chat");
  return { ...actual, answerChatMessage: answerChatMessageMock };
});
vi.mock("../../../lib/supabase-admin", () => ({
  createAdminClient: createAdminClientMock,
}));

const { POST } = await import("./route");
const { ChatError } = await import("../../../lib/chat");

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    answerChatMessageMock.mockReset();
    createAdminClientMock.mockClear();
  });

  it("returns 400 for a non-JSON body", async () => {
    const request = new Request("http://localhost/api/chat", { method: "POST", body: "not json" });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(answerChatMessageMock).not.toHaveBeenCalled();
  });

  it("returns 400 when agentSlug or message is missing", async () => {
    const response = await POST(jsonRequest({ message: "hi" }));

    expect(response.status).toBe(400);
    expect(answerChatMessageMock).not.toHaveBeenCalled();
  });

  it("returns 400 when message isn't a string", async () => {
    const response = await POST(jsonRequest({ agentSlug: "ask-breno", message: 123 }));

    expect(response.status).toBe(400);
  });

  it("returns the answer and citations on success", async () => {
    answerChatMessageMock.mockResolvedValue({ answer: "Hi there.", citations: ["https://example.com"] });

    const response = await POST(jsonRequest({ agentSlug: "ask-breno", message: "hi" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ answer: "Hi there.", citations: ["https://example.com"] });
    expect(answerChatMessageMock).toHaveBeenCalledWith({ fakeClient: true }, "ask-breno", "hi");
  });

  it("maps a ChatError to its declared HTTP status", async () => {
    answerChatMessageMock.mockRejectedValue(new ChatError("agent not found", 404));

    const response = await POST(jsonRequest({ agentSlug: "missing", message: "hi" }));
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "agent not found" });
  });

  it("maps an unexpected error to a generic 500 without leaking details", async () => {
    answerChatMessageMock.mockRejectedValue(new Error("supabase secret key leaked here"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(jsonRequest({ agentSlug: "ask-breno", message: "hi" }));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).not.toContain("secret key");
    consoleSpy.mockRestore();
  });
});
