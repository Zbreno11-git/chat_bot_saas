"use client";

import { CONTACT } from "../lib/i18n";
import { Chat } from "./components/Chat";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";

function LanguageToggle() {
  const { language, setLanguage, copy } = useLanguage();

  return (
    <div className="flex gap-1" role="group" aria-label="Language">
      {(["pt", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          aria-pressed={language === option}
          className={`rounded-none border px-2 py-1 text-xs font-medium ${
            language === option
              ? "border-(--accent) text-(--accent)"
              : "border-(--line) text-(--ink-muted) hover:text-(--ink)"
          }`}
        >
          {copy.languageToggle[option]}
        </button>
      ))}
    </div>
  );
}

function Identity() {
  const { copy } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl text-(--ink) sm:text-5xl">{copy.intro.name}</h1>
        <p className="mt-1 text-(--ink-muted)">{copy.intro.role}</p>
      </div>
      <p className="max-w-[36ch] text-(--ink)">{copy.intro.paragraph}</p>
      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-(--ink-muted)">{copy.contact.label}</span>
        <a href={`mailto:${CONTACT.email}`} className="text-(--accent) underline underline-offset-2 hover:no-underline">
          {CONTACT.email}
        </a>
        <a
          href={CONTACT.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-(--accent) underline underline-offset-2 hover:no-underline"
        >
          GitHub
        </a>
        <a
          href={CONTACT.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-(--accent) underline underline-offset-2 hover:no-underline"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}

function PageContent() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:flex-row lg:items-start lg:gap-12">
      <header className="flex flex-col gap-6 lg:sticky lg:top-12 lg:w-2/5">
        <Identity />
      </header>
      <main className="flex flex-1 flex-col gap-4">
        <Chat />
      </main>
    </div>
  );
}

export function AskBrenoPage() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-1 flex-col bg-(--paper)">
        <div className="mx-auto flex w-full max-w-4xl justify-end px-4 pt-4 sm:px-8">
          <LanguageToggle />
        </div>
        {/* Centers the intro + chat block when it's short (nothing asked
            yet); grows and scrolls naturally once the conversation fills
            the space, like a chat homepage. */}
        <div className="flex flex-1 flex-col justify-center">
          <PageContent />
        </div>
      </div>
    </LanguageProvider>
  );
}
