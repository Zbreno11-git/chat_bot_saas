"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { type Copy, type Language, translations } from "../../lib/i18n";

const STORAGE_KEY = "ask-breno-language";
const DEFAULT_LANGUAGE: Language = "pt";

// Minimal external store backing the language preference: localStorage plus
// an in-memory listener list so our own writes (the toggle button) notify
// useSyncExternalStore immediately, in the same tab. useSyncExternalStore
// (not useEffect+setState) is the React-recommended way to read a
// client-only value that can differ from the server-rendered default --
// it's what avoids the hydration mismatch without an extra render pass.
type Listener = () => void;
let listeners: Listener[] = [];

function subscribe(listener: Listener): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

// Picks pt unless the browser clearly prefers something else -- Breno and
// most of his current network are Brazilian, so pt is the safer default
// for a visitor whose language we can't detect.
function detectInitialLanguage(): Language {
  return navigator.language.toLowerCase().startsWith("en") ? "en" : DEFAULT_LANGUAGE;
}

function getSnapshot(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "en") return stored;
  } catch {
    // Falls through to detection; fine if storage is unavailable (e.g. a
    // private window that blocks it).
  }
  return detectInitialLanguage();
}

// Used for the server-rendered markup and the first client render, before
// hydration -- must be a fixed value so both sides match exactly.
function getServerSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

function setStoredLanguage(next: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Per-viewer convenience only; the in-memory notify below still runs
    // the UI, it just won't persist across reloads.
  }
  listeners.forEach((listener) => listener());
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  copy: Copy;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = useMemo(
    () => ({ language, setLanguage: setStoredLanguage, copy: translations[language] }),
    [language]
  );

  // The server-rendered <html lang> and <title> (app/layout.tsx) can only
  // pick one language, since language detection is client-only here (see
  // getServerSnapshot above). Once we know the real language, sync both --
  // document.documentElement.lang matters for screen readers, which use it
  // to choose pronunciation; leaving it stale would mislabel English
  // content as Portuguese (or vice versa).
  useEffect(() => {
    document.title = value.copy.meta.title;
    document.documentElement.lang = language;
  }, [value.copy, language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
