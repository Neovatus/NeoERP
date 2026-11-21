# Lane ready: BE-DOCS-1 (BackEnd docs for the 2026-11-21 decisions) — 2026-11-21

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-be-docs-1` (pushed, head `32b07dac`), on top of BE-RUN-1 `e3009697`:
the approved QA-guide pointer (`4ce6b1f5`, AGENTS.md), the brief and 8 docs commits. Docs only: no code, no Gradle.
Merge target: BE `phase/4` by fast-forward after BE-RUN-1. It needs a `verify.sh` marker like any `phase/4` push, so it
rides on the next BackEnd full run (with the next BackEnd lane) instead of its own 54-minute run.
**Brief:** `docs/agents/be-docs-1/brief.md`. Approved: Jabran 2026-11-21. **Builder:** Sonnet 5.5 high. **Review:**
Opus 5.5 fresh (brief + diff only): FIX (2 MEDIUM, 8 LOW) → fixed in `32b07dac`, checked by the lead (P-8 restored with
the ERP-Q6 pointer; ELMA only left in C-11's explanation and N-3's source paraphrase).

## What it records (`docs/agents/be-docs-1/builder-report.md`)
- Go-live: ERP-Q1 per country PK → NO → SE → DK → FI → IS, 6 weeks before each country's first customer, AI double
  review then the accountant on the open points (decision 13); no pilot or first-country plan; new **ERP-Q6** branch
  protection or CI by the first production customer (P-8's "Actions back on before the first hosted environment" kept).
- `post-release-backlog.md` marked superseded (decision 12).
- ADR-021 Q13/Q14 answered (decision 6), outside API waits for the public API platform ADR.
- Docout: C-11 Peppol SML/SMP lookup; D-121 Inexchange/Maventa (fallback Storecove), D-123 Amazon SES eu-north-1
  (fallback Mailgun EU), D-125 PRAL direct (fallback one licensed integrator) recorded.
- Other Accounts pages: withdrawn pilot and launch-order plans (roadmap amendment, H-D1, H-SE, D-38, README).

## Docs pages
Developer and operations pages above. User guide: none (no user-facing change).

## For Jabran
Verdict (lead's call: **MERGE**, landing with the next BackEnd full run).
