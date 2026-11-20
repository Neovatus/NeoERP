---
name: subagent-models
description: Opus is the default builder (Jabran 2026-11-15); Sonnet only for fully decided work; fresh Opus review after every build; Haiku mechanical; Fable only critical
metadata:
  node_type: memory
  type: feedback
  originSessionId: b5097442-afaa-4f92-9828-0b5c050187fe
  modified: 2026-10-13T08:38:37.349Z
---

**Current rule (Jabran 2026-11-15, final): Opus is the default builder.** Anthropic's dev-workflow test for Sonnet is "the design decisions are made"; our screen batches usually leave decisions open (A4 P2's Sonnet builder made 8 on its own) and the I18N trial favoured Opus. So: **Opus builds** full screen batches and anything where the spec leaves decisions open; **Sonnet builds** only fully decided work (review fixes, wording, copying an existing pattern, data layers from a fixed contract); **fresh Opus review after every build**, whichever model built it. Rest of the dev-workflow roles below still apply.

**Anthropic dev-workflow roles (reference):**
- **Opus 5.5:** plans, contracts, every review (fresh session, read-only), and implementing anything needing decisions or in risky areas (money/posting/tax, security/auth, locking/concurrency, migrations, tricky merges). Unblocks Sonnet when a task turns open-ended.
- **Sonnet 5.5: the default implementer** when the goal, decisions (approved spec/rig/contract), files and the check are all stated — e.g. screens from an approved rig, data layers, DTOs.
- **Haiku 5.5:** mechanical work (greps, summaries, renames, one known pattern, doc/backlog updates).
- **Fable 5.2:** only the most critical problems, or when Opus at high effort fails twice; our 2026-11-12 trial (≈2.3x Opus cost, few extra real findings) confirms Opus stays the default reviewer.
- **Always:** a fresh Opus review of every Sonnet/Haiku change before it lands (also WORKFLOW.md hard rule 2026-10-08). Medium effort default.

**Superseded table (2026-11-13, after the I18N trials and Anthropic's Opus 5.5 daily-driver article of 2026-11-12):** set `model` explicitly on every sub-agent.
- **Opus 5.5 (default):** builders, plans, every review, and anything touching posting, money/tax, security, locking or migrations.
- **Sonnet 5.5:** only small, well-scoped edits with a complete brief (copy fixes, one-file changes). If it would need its highest effort, use Opus instead.
- **Haiku 5.5:** mechanical checks (link checks, greps, counts, formatting).
- **Fable 5.2:** the highest-stakes reviews (security/money) when Jabran wants it, or long multi-agent runs of hours.
- **Effort before model:** leave effort at the default (Medium) unless a rule asks otherwise. When a result disappoints, first rerun at High; move up a model only if it had the context, clearly tried, and still got it wrong. (Agent `effort` may only be set when Jabran/CLAUDE.md/a skill asks for it; ask Jabran before raising it.)
- **Briefs:** one message with the goal, the finished output, the files to read and **when to stop and ask** (template in docs/agents/codex-briefs/README.md "Stop and ask"); never "think hard" phrases.
- Keep prompts short: point to files instead of pasting, one task each.

**History:** 2026-10-13 rule was Haiku for drafting, Sonnet for building, Opus only for plans/reviews/critical parts (Jabran flagged cost; ERP-37/39, lead-agent-structure.md §3a). Superseded for builders by the 2026-11-12 trials below.

**Update (Jabran 2026-11-02):** reviews of Codex builder work and every security/money/posting review run on **Opus 5.5**, not Sonnet. Sonnet reviews on 2026-11-01 missed things (C11's V45 migration clash; reused UP-TO-DATE test results), so Codex later hit conflicts. Every review must: `git fetch` first, list new migration files against the latest origin/dev, rerun tests (`--rerun`) rather than trust cached results. Sonnet stays for building and research summaries.

**Review on every new model release (Jabran 2026-11-10):** when Anthropic ships new models, re-check this table against the published prices and "best for" guidance before the next round and tell Jabran the proposed changes. Prices 2026-11 ($/1M in/out): Haiku 5.5 0.10/0.50 (prompts over 100k tokens: 0.50/2.50) · Sonnet 5.5 2/10 · Opus 5.5 4/20 · Fable 5.2 8/40 (Fable 5.1 was 10/50) · Mythos 5.2 8/40, verified orgs only, for security and life-sciences research. Fable 5.2: "demanding reasoning and long-horizon agentic work, or when Opus 5.5 at higher effort still falls short"; Opus 5.5 is Anthropic's recommended default. Mythos needs the Cyber Verification Program. Verified on platform.claude.com pricing + models overview 2026-11-10.

**Trials 2026-11-12 (I18N):** L1 Sonnet builder 2H/6M vs L2 Opus builder 0H/4M → Opus for translation builders. L7 blind review on the same diff: Opus 243k tok, 6 min, 0H/6M/9L; Fable 5.2 285k tok, 8 min, 0H/9M/17L, ~2.3x cost; the same core findings, Fable added ~1 real Medium + ~8 translation polish fixes (1 false positive), Opus caught 2 that Fable missed. Verdict: Opus stays the default reviewer; Fable only for the highest-stakes reviews (security/money) if Jabran wants.
