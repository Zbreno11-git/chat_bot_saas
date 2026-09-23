import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { resolvePublishedAgent } from "./agents";

// Builds a fake Supabase client whose `.from().select().eq().eq().maybeSingle()`
// chain resolves to the given result, and records the eq() calls so tests
// can assert the query was scoped correctly.
function fakeSupabase(result: { data: unknown; error: unknown }) {
  const eqCalls: [string, unknown][] = [];
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn((column: string, value: unknown) => {
      eqCalls.push([column, value]);
      return chain;
    }),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
  };
  const from = vi.fn(() => chain);

  return { client: { from } as unknown as SupabaseClient, from, eqCalls };
}

describe("resolvePublishedAgent", () => {
  it("returns the agent when found and published", async () => {
    const agent = { id: "agent-1", slug: "ask-breno", name: "Ask Breno" };
    const { client, from, eqCalls } = fakeSupabase({ data: agent, error: null });

    const result = await resolvePublishedAgent(client, "ask-breno");

    expect(result).toEqual(agent);
    expect(from).toHaveBeenCalledWith("agents");
    expect(eqCalls).toEqual([
      ["slug", "ask-breno"],
      ["state", "published"],
    ]);
  });

  it("returns null when no agent matches (missing or not published)", async () => {
    const { client } = fakeSupabase({ data: null, error: null });

    const result = await resolvePublishedAgent(client, "draft-agent");

    expect(result).toBeNull();
  });

  it("throws when the query errors", async () => {
    const { client } = fakeSupabase({ data: null, error: new Error("db down") });

    await expect(resolvePublishedAgent(client, "ask-breno")).rejects.toThrow("db down");
  });
});
