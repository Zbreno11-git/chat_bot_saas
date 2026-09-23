---
name: socratic-step-recap
description: Use at the end of each Ask Breno MVP step (each PROGRESS.md row), right before or after opening the PR, to explain what was built, how, and why in a way Breno can follow despite knowing no JS/TypeScript. Not for mid-step pauses.
---

# Socratic step recap

## When to use this

Claude now writes the code for the Ask Breno MVP (see `CLAUDE.md`, "How we work"). Breno still wants to understand what got built and why — the checkpoint moved from "he types every line" to "Claude explains the reasoning once the step is done." Use this skill once per step, at the end, not mid-step: finishing a step's implementation and opening its PR is the trigger.

## What "Socratic" means here

Not a lecture, and not a code walkthrough line by line. The goal is to make Breno reconstruct the reasoning with you, not just receive it:

- Where a real choice existed (a library, a data shape, a chunking strategy, an error-handling approach), ask a short guiding question first — something Breno's Python/SQL background can actually reason about — before giving the answer. Example shape: "Pra decidir onde fazer o upsert, pensa em SQL puro: você faria `ON CONFLICT` em qual coluna, pra não duplicar o mesmo arquivo se eu rodar o script de novo?" Then confirm or correct his answer and explain what was actually done.
- Keep it technical but not overloaded — accurate terms, no dumbed-down hand-waving, but no unnecessary jargon either. Bridge to Python/SQL equivalents when that shortens the explanation.
- Portuguese for the explanation, English for code, identifiers, and technical terms, per `CLAUDE.md`.

## Structure

1. **O que foi construído** — one short paragraph, plain terms, no code dump.
2. **Decisões-chave** — for each real decision (not every line): the alternatives considered, a guiding question to Breno where it fits naturally, then the reasoning for what was chosen.
3. **Bugs ou erros encontrados** — what broke, the actual root cause (not just "corrigi"), and how it was diagnosed.
4. **Em aberto** — anything Breno might want to weigh in on for the next step, if applicable.

## What this skill is not

- Not a substitute for the PR itself — the PR still needs a clear description for anyone else reading the repo (recruiters may browse it).
- Not a trigger for asking Breno to approve implementation choices before coding — Claude decides and builds, then explains. Only stop mid-step for a decision that's genuinely Breno's to make (budget, scope, privacy trade-offs — the kind of call `CLAUDE.md` already reserves for him).
