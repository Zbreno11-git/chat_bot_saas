// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider, useLanguage } from "./LanguageContext";

function setBrowserLanguage(locale: string) {
  Object.defineProperty(window.navigator, "language", { value: locale, configurable: true });
}

function Probe() {
  const { language, setLanguage, copy } = useLanguage();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="heading">{copy.chat.heading}</span>
      <button onClick={() => setLanguage("en")}>to-en</button>
      <button onClick={() => setLanguage("pt")}>to-pt</button>
    </div>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    cleanup();
  });

  it("defaults to pt when the browser language isn't English", () => {
    setBrowserLanguage("pt-BR");
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );

    expect(screen.getByTestId("language")).toHaveTextContent("pt");
  });

  it("detects an English browser language", () => {
    setBrowserLanguage("en-US");
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );

    expect(screen.getByTestId("language")).toHaveTextContent("en");
  });

  it("prefers a stored preference over browser detection", () => {
    setBrowserLanguage("en-US");
    localStorage.setItem("ask-breno-language", "pt");
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );

    expect(screen.getByTestId("language")).toHaveTextContent("pt");
  });

  it("switches language and persists the choice", async () => {
    setBrowserLanguage("pt-BR");
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );

    await act(() => user.click(screen.getByText("to-en")));

    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(localStorage.getItem("ask-breno-language")).toBe("en");
  });

  it("throws when useLanguage is used outside a provider", () => {
    function Broken() {
      useLanguage();
      return null;
    }

    expect(() => render(<Broken />)).toThrow("useLanguage must be used within a LanguageProvider");
  });
});
