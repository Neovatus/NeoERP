# Lane verdict: AC418-BE (4.18 backend + N10) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): BE `phase/4` `409f45e5` → `095a8989` (fast-forward, RISK marker).
- Scope: company default tax codes (V78 `ac418_company_default_tax_codes`, `defaultFor`, PATCH, 409 `TAX_CODE_IS_DEFAULT`, DB CHECK + partial unique), journal listing `from`/`to`, recurring `nextMemo`, **N10**: duplicate receivables opening items refused for every entry path (V78 unique index on company, customer, direction, normalised original number over SUBMITTED/POSTED/import drafts; 409 `DUPLICATE_CUSTOMER_ITEM` at preview, confirm, submit, approve, draft edit; per document type by lead ruling). No AI attribution.
- Reviews: round 1 Opus ACCEPT (3 LOW), Fable FIX (HIGH: hand entry not covered; MEDIUM: faked test path). Fix round + type-key correction; gate 1 failed 2 tests (shape list, lost repository classification); gate fix. Final: Fable ACCEPT + Opus ACCEPT on `21619145` (`review-5-fable.md`, `review-6-opus.md`).
- **Gate 2:** `verify: OK`, 12 min, 4513 tests, 0 failed, 59 skipped, money invariants OK. Old FAIL/new PASS: 15 of 16 fix tests and 21 of 65 build tests failed on the base (two hand submits gave [200, 200]: doubled receivable).
- **Migration order:** V78 merged before AL-REST-BE's V77 → AL-REST-BE renumbers to V79 before its gate (rule: second to merge renumbers).
- Escaped defect closed: N10 row in `docs/process/escaped-defects.md` → fixed in AC418-BE.

## Timeline (MEASURE-1)
- Build 48 min (473k); review round 1 Opus 6 min, Fable 4 min; Rework: fix round 1 40 min + type key ~10 min + gate fix 12 min; re-stamps ~1–2 min each; gate 1 12 min (failed), gate 2 12 min; merged 11:3x Europe/Oslo. Changed files ~75, items 7 (BE-1..BE-7). Lessons: targeted sets missed `:architecture-tests` and a domain test → L36: full suite of every touched service + architecture tests before hand-back.
