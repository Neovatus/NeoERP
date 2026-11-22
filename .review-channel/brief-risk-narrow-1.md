# Brief: RISK-NARROW-1 — risk paths only where money or security is decided, BackEnd and App (2026-11-22)

**Approved:** Jabran 2026-11-22: "yes to … changing narrow risk path list". Measured reason (`docs/process/phase4-rework.md`,
`phase4-timing-analysis.md`): the App list (101 globs) covers nearly all Accounts screens, so screen-only lanes need two
reviewers; the Sonnet money-display second reviews found 0 HIGH/MEDIUM money or locale findings in Phase 4.
**Lanes:** App `phase/4-b2-risk-narrow-app`, BackEnd `phase/4-b2-risk-narrow-be`, each from its `phase/4` (may start before
GATE-2 merges only if GATE-2 does not change `docs/risk-paths.txt`; otherwise after it). Copy to `docs/agents/risk-narrow-1/brief.md`.
**Builder:** Opus 5.5 high. **Reviews:** fresh Opus + Fable 5.2 high (diff + brief only). The file is a gate file → RISK.

## Keep RISK (two different reviewers)
Code that **decides** money, security or company data: money types and amount parsing/formatting (`core/money`, `NeoFormat*`,
amount input kinds), domain rules, everything that builds or sends a server request or reads its answer (`data/**`,
mappers, repositories, API clients), state/view-model code that builds posting, approval, payment or delete requests,
access and permission rules (`*Access.kt`, feature gates, company scope, session/auth), and every gate file.
BackEnd: services' domain, persistence, migrations, security/auth, controllers and their request/response types,
outbound ports, money invariants, tenant isolation; only clearly non-deciding paths leave (e.g. docs-only resources).

## Leave RISK (one fresh Opus review, as every lane)
Pure presentation: composables and layout (`ui/**`, `*Screen.kt`, `*Card*.kt`, tabs, lists), wording, previews, screen-size tests.
When a file mixes layout and request-building, keep it RISK, or split it in a later lane (never by guess).

## Method
1. For each glob: keep / narrow (to which files) / drop, with one line of reason, in `docs/agents/risk-narrow-1/decisions.md`.
2. Replay: run `risk-check.sh` (old list vs new list) over every Phase 4 lane range; list each lane that would change from RISK to
   NORMAL and check against `phase4-rework.md` that none of its HIGH/MEDIUM findings were money/security ones.
3. Self-tests updated (`risk-check-test.sh`); `verify.md` and WORKFLOW pointer text updated.

## Done when
Both lists narrowed with reasons, the replay table in the builder report, self-tests pass, two ACCEPT reviews (Fable checks
every dropped glob), lane-ready with a Timeline block (MEASURE-1, five buckets).
