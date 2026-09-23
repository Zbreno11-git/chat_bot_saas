// Reads every content/**/*.md file and upserts it into knowledge_sources +
// knowledge_chunks for the "ask-breno" agent.
//
// Run from web/: npm run ingest

import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { chunkMarkdown, listContentFiles } from "../lib/content";
import { createAdminClient } from "../lib/supabase-admin";

config({ path: path.join(process.cwd(), ".env.local") });

const AGENT_SLUG = "ask-breno";
const CONTENT_DIR = path.join(process.cwd(), "..", "content");

const supabase = createAdminClient();

async function ingestFile(agentId: string, origin: string, filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");

  const { data: source, error: sourceError } = await supabase
    .from("knowledge_sources")
    .upsert({ agent_id: agentId, origin, content }, { onConflict: "agent_id,origin" })
    .select()
    .single();

  if (sourceError) throw sourceError;

  // Drop the previous chunks for this source so re-running the script doesn't
  // leave stale chunks behind when a file shrinks or a section is removed.
  const { error: deleteError } = await supabase
    .from("knowledge_chunks")
    .delete()
    .eq("source_id", source.id);

  if (deleteError) throw deleteError;

  const chunks = chunkMarkdown(content);
  const { error: insertError } = await supabase.from("knowledge_chunks").insert(
    chunks.map((body, index) => ({
      source_id: source.id,
      agent_id: agentId,
      chunk_index: index,
      body,
    }))
  );

  if (insertError) throw insertError;

  console.log(`Ingested ${origin} (${chunks.length} chunks)`);
}

async function main() {
  const { data: agent, error } = await supabase
    .from("agents")
    .select("id")
    .eq("slug", AGENT_SLUG)
    .single();

  if (error || !agent) {
    throw new Error(`Agent "${AGENT_SLUG}" not found: ${error?.message}`);
  }

  const files = listContentFiles(CONTENT_DIR);

  for (const { origin, filePath } of files) {
    await ingestFile(agent.id, origin, filePath);
  }
}

main();
