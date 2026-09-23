import { describe, expect, it } from "vitest";
import { formatCitationLabel } from "./format-url";

describe("formatCitationLabel", () => {
  it("strips the protocol and keeps host + path", () => {
    expect(formatCitationLabel("https://github.com/Zbreno11-git/smart-store-dbt")).toBe(
      "github.com/Zbreno11-git/smart-store-dbt"
    );
  });

  it("drops a leading www.", () => {
    expect(formatCitationLabel("https://www.linkedin.com/in/breno-zamponi")).toBe(
      "linkedin.com/in/breno-zamponi"
    );
  });

  it("drops a bare root path", () => {
    expect(formatCitationLabel("https://example.com/")).toBe("example.com");
    expect(formatCitationLabel("https://example.com")).toBe("example.com");
  });

  it("falls back to the raw string for an invalid URL", () => {
    expect(formatCitationLabel("not-a-url")).toBe("not-a-url");
  });
});
