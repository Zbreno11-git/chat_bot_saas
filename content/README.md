# Content drafts (not yet approved)

This is the curated knowledge base drafted from `breno_docs/` (master CV, recommendation letters, repo links and their READMEs). Per the roadmap, every claim about Breno's work must be checked against a current source before entering the published base, and Breno approves the source of truth — so **nothing here is committed as a live source yet.** Review it, correct anything wrong, fill in `ground-truth.md`, then we approve and ingest it in the coding step.

- `bio.md` — summary, skills, education, experience. No phone number (see Resolved below).
- `projects.md` — one section per project: stack, description, evidence (repo, live demo, "Local Workspace," or "contact for a walkthrough"), and the exact source used for each claim.
- `recommendations.md` — the two recommendation letters, referees' personal emails left out by default.
- `projects/lifeos-readme.md` and `projects/altiva-serra-readme.md` — short, public-safe write-ups of two projects that aren't on the CV and aren't standard GitHub evidence: tech stack and vision only, no business-sensitive specifics (e.g. no scraped listing sources, no client/broker names, no calendar/personal data).
- `ground-truth.md` — five career questions for Breno to answer directly in the file, used to settle anything where the CV and the letters disagree.

## What was cross-checked

16 links in `repo_links` → resolved all 16 via the GitHub API (including the private `altiva_serra`, which your `gh` login already had access to) and pulled each README. Matched 14 of the CV's 18 projects to a repo.

## Resolved

- **LifeOs and Altiva Serra:** both are listed as projects. Evidence is "Local Workspace" (their short READMEs in `projects/`), not a raw repo link — tech stack and vision are public, business/personal specifics are not.
- **Projects with no GitHub repo** (financial agent → n8n workflow, résumé adapter → Streamlit app, Banco Central dashboard → Power BI report, Spotify EDA): each now names its actual evidence type and says to contact Breno for a walkthrough, instead of a bare "no source."
- **"Pursuing AI consulting full-time"** (Teen Health letter): not accurate as a status claim. Superseded by `ground-truth.md` question 1.
- **Contact channel(s):** email is the main contact, plus GitHub/LinkedIn. No phone number anywhere in public content.

## Not yet done (next roadmap step, not this one)

- The 3–5 flagship projects for launch (roadmap wants 3–5, we have 19 candidates). My instinct for the flagship set: **SaaS Communications churn** (full ML + BI + PM story), **Smart Store IoT pipeline** (most technically distinctive), **Business Card Scanner** (real nonprofit deployment with AI), **Vitality Compass** (full-stack, live demo), and **AI Financial Agent** (production AI agent, multi-tool integration) — tell me if you'd swap any of these.
- The 30 evaluation questions (including ones the agent should refuse).
- Breno's answers in `ground-truth.md`.
