# Project skills

Third-party agent skills vendored for Claude Code, chosen for the Ask Breno MVP stack (Next.js + TypeScript, Supabase/Postgres, LLM chat with citations). Each folder keeps its upstream license.

| Skill | Use it for | Source (commit) | License |
| --- | --- | --- | --- |
| frontend-design | Distinctive, production-grade UI | anthropics/skills (34040c9) | Apache-2.0 |
| webapp-testing | Playwright checks of the running app | anthropics/skills (34040c9) | Apache-2.0 |
| vercel-react-best-practices | React/Next.js performance rules | vercel-labs/agent-skills (063bee9) | MIT |
| vercel-composition-patterns | Scalable React component APIs | vercel-labs/agent-skills (063bee9) | MIT |
| web-design-guidelines | UI/accessibility review | vercel-labs/agent-skills (063bee9) | MIT |
| supabase | Supabase auth, RLS, storage, edge functions | supabase/agent-skills (8331f91) | MIT |
| supabase-postgres-best-practices | Schema, indexes, query performance | supabase/agent-skills (8331f91) | MIT |
| brainstorming | Turn an idea into an approved design | obra/superpowers (5bf4e78) | MIT |
| writing-plans | Break a design into small tested tasks | obra/superpowers (5bf4e78) | MIT |
| executing-plans | Work through a plan in this session | obra/superpowers (5bf4e78) | MIT |
| subagent-driven-development | Work through a plan with subagents | obra/superpowers (5bf4e78) | MIT |
| using-git-worktrees | Isolated workspace per feature | obra/superpowers (5bf4e78) | MIT |
| test-driven-development | Red, green, refactor | obra/superpowers (5bf4e78) | MIT |
| systematic-debugging | Root cause before fixes | obra/superpowers (5bf4e78) | MIT |
| verification-before-completion | Evidence before claiming done | obra/superpowers (5bf4e78) | MIT |
| requesting-code-review | Review work before merging | obra/superpowers (5bf4e78) | MIT |
| receiving-code-review | Evaluate review feedback | obra/superpowers (5bf4e78) | MIT |
| finishing-a-development-branch | Merge, PR, or clean up a branch | obra/superpowers (5bf4e78) | MIT |

## Local changes

- `web-design-guidelines` reads a pinned `guidelines.md` (vercel-labs/web-interface-guidelines, e3d624b) instead of fetching from GitHub on every run.
- Superpowers skills refer to each other as `superpowers:<name>`; here they are installed without the prefix.
- The optional brainstorming browser companion loads its logo from primeradiant.com; set `SUPERPOWERS_DISABLE_TELEMETRY=1` to avoid that request.

To update a skill, re-copy it from upstream and review the diff before committing.
