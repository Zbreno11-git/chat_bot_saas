// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Chat } from "./Chat";
import { LanguageProvider } from "./LanguageContext";

function renderChat() {
  return render(
    <LanguageProvider>
      <Chat />
    </LanguageProvider>
  );
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

beforeEach(() => {
  Object.defineProperty(window.navigator, "language", { value: "pt-BR", configurable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe("Chat", () => {
  it("shows suggested questions before any message is sent", () => {
    renderChat();

    expect(screen.getByText("Qual a experiência dele com Python?")).toBeInTheDocument();
  });

  it("sends the clicked suggested question to /api/chat with the fixed agent slug", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ answer: "Ele usa Python.", citations: [] }));
    vi.stubGlobal("fetch", fetchMock);

    renderChat();
    await userEvent.click(screen.getByText("Qual a experiência dele com Python?"));

    await waitFor(() => expect(screen.getByText("Ele usa Python.")).toBeInTheDocument());

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ agentSlug: "ask-breno", message: "Qual a experiência dele com Python?" }),
      })
    );
  });

  it("shows the answer's citations as links", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          answer: "Repo aqui.",
          citations: ["https://github.com/Zbreno11-git/smart-store-dbt"],
        })
      )
    );

    renderChat();
    await userEvent.type(screen.getByPlaceholderText("Escreva sua pergunta..."), "Onde fica o repo?{enter}");

    const link = await screen.findByRole("link", { name: "github.com/Zbreno11-git/smart-store-dbt" });
    expect(link).toHaveAttribute("href", "https://github.com/Zbreno11-git/smart-store-dbt");
  });

  it("shows a loading state while waiting for the response", async () => {
    let resolveFetch!: (value: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
      )
    );

    renderChat();
    await userEvent.type(screen.getByPlaceholderText("Escreva sua pergunta..."), "Oi{enter}");

    expect(screen.getByText("Pensando...")).toBeInTheDocument();

    resolveFetch(jsonResponse({ answer: "Oi!", citations: [] }));
    await waitFor(() => expect(screen.queryByText("Pensando...")).not.toBeInTheDocument());
  });

  it("shows the 'not available yet' message for a 404 (unpublished agent)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: "agent not found" }, 404)));

    renderChat();
    await userEvent.type(screen.getByPlaceholderText("Escreva sua pergunta..."), "Oi{enter}");

    expect(await screen.findByText("O chat ainda não está disponível publicamente.")).toBeInTheDocument();
  });

  it("shows a generic error message on a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    renderChat();
    await userEvent.type(screen.getByPlaceholderText("Escreva sua pergunta..."), "Oi{enter}");

    expect(await screen.findByText("Algo deu errado. Tenta de novo.")).toBeInTheDocument();
  });

  it("does not send an empty or whitespace-only message", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderChat();
    await userEvent.type(screen.getByPlaceholderText("Escreva sua pergunta..."), "   {enter}");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
