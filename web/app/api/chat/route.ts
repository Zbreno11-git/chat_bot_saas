import { NextResponse } from "next/server";
import { answerChatMessage, ChatError } from "../../../lib/chat";
import { createAdminClient } from "../../../lib/supabase-admin";

type ChatRequestBody = {
  agentSlug?: unknown;
  message?: unknown;
};

// POST /api/chat -- the only entry point into the answer flow described in
// CLAUDE.md's architecture rules. Thin by design: request parsing and HTTP
// status mapping live here, the actual flow (resolve agent, retrieve,
// call the model, check citations) lives in lib/chat.ts where it's unit
// tested without needing a real HTTP request.
export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const { agentSlug, message } = body;
  if (typeof agentSlug !== "string" || typeof message !== "string") {
    return NextResponse.json(
      { error: "agentSlug and message are required and must be strings" },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const result = await answerChatMessage(supabase, agentSlug, message);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ChatError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    // Never leak internal error details (could include Supabase/Gemini
    // error text) to the browser -- log server-side only.
    console.error("POST /api/chat failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
