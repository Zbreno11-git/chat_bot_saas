"use client";

import { useId, useState } from "react";
import { AGENT_SLUG } from "../../lib/i18n";
import { formatCitationLabel } from "../../lib/format-url";
import { useLanguage } from "./LanguageContext";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "agent"; text: string; citations: string[] }
  | { id: string; role: "error"; text: string };

type ChatApiResponse = { answer: string; citations: string[] };

function nextId() {
  return crypto.randomUUID();
}

export function Chat() {
  const { language, copy } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputId = useId();

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setMessages((current) => [...current, { id: nextId(), role: "user", text: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentSlug: AGENT_SLUG, message: trimmed }),
      });

      if (!response.ok) {
        const errorText = response.status === 404 ? copy.chat.errorUnavailable : copy.chat.errorGeneric;
        setMessages((current) => [...current, { id: nextId(), role: "error", text: errorText }]);
        return;
      }

      const data = (await response.json()) as ChatApiResponse;
      setMessages((current) => [
        ...current,
        { id: nextId(), role: "agent", text: data.answer, citations: data.citations },
      ]);
    } catch {
      setMessages((current) => [...current, { id: nextId(), role: "error", text: copy.chat.errorGeneric }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      aria-label={copy.chat.heading}
      className="flex flex-col gap-4 rounded-none border border-(--line) bg-(--paper) p-5 sm:p-6"
    >
      <h2 className="font-display text-xl text-(--ink)">{copy.chat.heading}</h2>

      <div className="flex min-h-40 flex-col gap-4" role="log" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="w-full text-sm text-(--ink-muted)">{copy.chat.suggestedLabel}</span>
            {copy.chat.suggestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => ask(question)}
                className="rounded-none border border-(--line) bg-(--accent-soft) px-3 py-1.5 text-sm text-(--ink) transition-colors hover:border-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} sourcesLabel={copy.chat.sourcesLabel} />
        ))}

        {isLoading && <p className="text-sm text-(--ink-muted)">{copy.chat.thinking}</p>}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
        className="flex gap-2"
      >
        <label htmlFor={inputId} className="sr-only">
          {copy.chat.placeholder}
        </label>
        <input
          id={inputId}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={copy.chat.placeholder}
          lang={language}
          disabled={isLoading}
          maxLength={1000}
          className="flex-1 rounded-none border border-(--line) bg-transparent px-3 py-2 text-(--ink) placeholder:text-(--ink-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-none bg-(--accent) px-4 py-2 font-medium text-(--paper) transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
        >
          {copy.chat.send}
        </button>
      </form>
    </section>
  );
}

function ChatBubble({ message, sourcesLabel }: { message: ChatMessage; sourcesLabel: string }) {
  if (message.role === "user") {
    return (
      <p className="self-end rounded-none bg-(--accent-soft) px-3 py-2 text-(--ink)">{message.text}</p>
    );
  }

  if (message.role === "error") {
    return <p className="text-sm text-(--ink-muted)">{message.text}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-(--ink)">{message.text}</p>
      {message.citations.length > 0 && (
        <div className="flex flex-col gap-1 font-mono text-xs text-(--ink-muted)">
          <span>{sourcesLabel}</span>
          <ul className="flex flex-col gap-0.5">
            {message.citations.map((citation, index) => (
              <li key={citation}>
                [{index + 1}]{" "}
                <a
                  href={citation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--accent) underline underline-offset-2 hover:no-underline"
                >
                  {formatCitationLabel(citation)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
