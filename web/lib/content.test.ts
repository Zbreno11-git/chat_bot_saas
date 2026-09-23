import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { chunkMarkdown, listContentFiles } from "./content";

describe("chunkMarkdown", () => {
  it("splits on top-level sections", () => {
    const content = "# Title\n\nIntro text.\n\n## Section A\n\nBody A.\n\n## Section B\n\nBody B.\n";

    const chunks = chunkMarkdown(content);

    expect(chunks).toEqual([
      "# Title\n\nIntro text.",
      "## Section A\n\nBody A.",
      "## Section B\n\nBody B.",
    ]);
  });

  it("returns the whole document as one chunk when there are no ## sections", () => {
    const content = "# Title\n\nJust one paragraph, no subsections.";

    expect(chunkMarkdown(content)).toEqual([content]);
  });

  it("drops empty chunks from trailing whitespace", () => {
    const content = "## Section A\n\nBody A.\n\n## Section B\n\nBody B.\n\n";

    const chunks = chunkMarkdown(content);

    expect(chunks).toHaveLength(2);
    expect(chunks.every((chunk) => chunk.length > 0)).toBe(true);
  });
});

describe("listContentFiles", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-test-"));
    fs.writeFileSync(path.join(tempDir, "bio.md"), "# Bio");
    fs.writeFileSync(path.join(tempDir, "README.md"), "internal notes");
    fs.writeFileSync(path.join(tempDir, "ground-truth.md"), "## 1. Question\n\n**Answer:**\n- answered");
    fs.writeFileSync(path.join(tempDir, "notes.txt"), "not markdown");
    fs.mkdirSync(path.join(tempDir, "projects"));
    fs.writeFileSync(path.join(tempDir, "projects", "lifeos-readme.md"), "# LifeOs");
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("finds markdown files recursively, skipping README.md but keeping ground-truth.md", () => {
    const files = listContentFiles(tempDir);
    const origins = files.map((file) => file.origin).sort();

    expect(origins).toEqual(["bio", "ground-truth", "projects/lifeos-readme"]);
  });

  it("returns absolute file paths that can be read directly", () => {
    const files = listContentFiles(tempDir);
    const bio = files.find((file) => file.origin === "bio");

    expect(bio).toBeDefined();
    expect(fs.readFileSync(bio!.filePath, "utf-8")).toBe("# Bio");
  });
});
