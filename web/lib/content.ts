import fs from "node:fs";
import path from "node:path";

// Files under content/ that are internal curation notes, not public knowledge
// for the agent (see content/README.md).
export const EXCLUDED_CONTENT_FILES = new Set(["README.md", "ground-truth.md"]);

export type ContentFile = {
  // Path relative to content/, without the extension, e.g. "projects/lifeos-readme".
  // Used as knowledge_sources.origin.
  origin: string;
  filePath: string;
};

// Recursively lists every .md file under `dir`, skipping EXCLUDED_CONTENT_FILES.
export function listContentFiles(dir: string, baseDir: string = dir): ContentFile[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: ContentFile[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...listContentFiles(entryPath, baseDir));
      continue;
    }

    if (!entry.name.endsWith(".md") || EXCLUDED_CONTENT_FILES.has(entry.name)) {
      continue;
    }

    const relativePath = path.relative(baseDir, entryPath);
    const origin = relativePath.replace(/\.md$/, "").split(path.sep).join("/");
    files.push({ origin, filePath: entryPath });
  }

  return files;
}

// Splits markdown into chunks by top-level (##) sections.
// Good enough for now; revisit in step 04 if retrieval quality needs smaller chunks.
export function chunkMarkdown(content: string): string[] {
  const sections = content.split(/\n(?=## )/);
  return sections.map((section) => section.trim()).filter(Boolean);
}
