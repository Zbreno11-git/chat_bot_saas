// UI copy for the two languages the page ships in (CLAUDE.md: "Bilingual
// from day one: ... UI in PT and EN"). The agent's own answers are already
// in the visitor's language by the time they reach the client (see
// lib/llm/prompt.ts) -- this file is only the static chrome around them.
export type Language = "pt" | "en";

export const AGENT_SLUG = "ask-breno";

// Contact details aren't translated, so they live outside the per-language
// copy below. Source: content/bio.md. No phone number, per CLAUDE.md.
export const CONTACT = {
  email: "zamponibreno1102@gmail.com",
  github: "https://github.com/Zbreno11-git",
  linkedin: "https://linkedin.com/in/breno-zamponi",
};

export type Copy = {
  // Only title -- the tab title is synced to it client-side (see
  // LanguageContext.tsx). The <meta description> is SEO-facing and stays
  // server-rendered in a single fixed language (app/layout.tsx); syncing it
  // client-side would only reach a browser that already loaded the page.
  meta: { title: string };
  intro: {
    name: string;
    role: string;
    paragraph: string;
  };
  contact: {
    label: string;
  };
  chat: {
    heading: string;
    placeholder: string;
    send: string;
    thinking: string;
    suggestedLabel: string;
    suggestions: string[];
    sourcesLabel: string;
    errorUnavailable: string;
    errorGeneric: string;
  };
  languageToggle: { pt: string; en: string };
};

// TypeScript enforces that both languages define every key above -- no
// separate test needed to catch a missing translation.
export const translations: Record<Language, Copy> = {
  pt: {
    meta: { title: "Ask Breno" },
    intro: {
      name: "Breno Zamponi",
      role: "Data Analyst & Engenheiro de IA",
      paragraph:
        "Pergunte sobre minha experiência, projetos e stack. Cada resposta cita a fonte — currículo público, repositório ou página do projeto. Sem fonte, eu digo que não sei.",
    },
    contact: { label: "Contato" },
    chat: {
      heading: "Pergunte pro Breno",
      placeholder: "Escreva sua pergunta...",
      send: "Perguntar",
      thinking: "Pensando...",
      suggestedLabel: "Perguntas pra começar",
      suggestions: [
        "Quais projetos usam IA generativa?",
        "Qual a experiência dele com Python?",
        "O que é o projeto Smart Store?",
        "Ele está disponível pra trabalho remoto?",
      ],
      sourcesLabel: "Fontes",
      errorUnavailable: "O chat ainda não está disponível publicamente.",
      errorGeneric: "Algo deu errado. Tenta de novo.",
    },
    languageToggle: { pt: "PT", en: "EN" },
  },
  en: {
    meta: { title: "Ask Breno" },
    intro: {
      name: "Breno Zamponi",
      role: "Data Analyst & AI Engineer",
      paragraph:
        "Ask about my experience, projects and stack. Every answer cites its source — public CV, a repo, or a project page. No source, and I'll say so.",
    },
    contact: { label: "Contact" },
    chat: {
      heading: "Ask Breno",
      placeholder: "Type your question...",
      send: "Ask",
      thinking: "Thinking...",
      suggestedLabel: "Questions to start with",
      suggestions: [
        "Which projects use generative AI?",
        "What's his experience with Python?",
        "What is the Smart Store project?",
        "Is he available for remote work?",
      ],
      sourcesLabel: "Sources",
      errorUnavailable: "The chat isn't publicly available yet.",
      errorGeneric: "Something went wrong. Try again.",
    },
    languageToggle: { pt: "PT", en: "EN" },
  },
};
