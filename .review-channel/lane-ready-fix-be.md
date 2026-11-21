# Lane ready: FIX-BE (QA batch 2 backend fixes) — 2026-11-21

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-fix-be-r` (pushed, head `a50eabbb`, 35 commits on BE `phase/4` `4b924f08`, which holds R34-BE). The older `phase/4-b2-fix-be` holds only the pre-rebase brief commit (stale; delete with Jabran's OK). Merge target: BE `phase/4`, fast-forward through the hook.
**Brief:** `docs/agents/fix-be/brief.md` (fix list R04, R07–R10, R13, R17, R19, R20, R25, R29, R30 a/b). Approved: Jabran 2026-11-20. **Money/security lane.**
**Builder:** Opus 5.5 high. **Reviewers:** Opus 5.5 fresh (rounds 1, 1b, 1c, rebase 1d, 1e) and an independent second reviewer: Fable 5.2 security, high (rounds 1 and 2b), then Sonnet 5.5 (rounds 3, 3b, rebase 2e, 2f).

## Rows
| Row | Result |
|---|---|
| R04 | Cause found, no BE change (a stale saved report filter on one device; App fix in App B) |
| R07 | App only (D-15) |
| R08 | `{period}`/`{month}` in the one month format per D-19 (six countries) |
| R09 | SIE org number compared with Org's value today (go-live fallback; each read caught on its own) |
| R10 | TB by branch: `OTHER_BRANCHES` + `NO_BRANCH` sum exactly to the old row; `NO_BRANCH` only when branch is the only filter (D-16) |
| R13 | No change: one branch, the engine fills it |
| R17 | History "By" shows who discarded a row and when |
| R19 | "Ends after N times" no longer counts skipped dates |
| R20 | General ledger lines carry cost centre and project |
| R25 | Duplicate-file refusal says when and by whom |
| R29 | Partly by design (D-18, D-21): 16 system ports classified on a named-class allowlist with frozen methods; baseline 60 → 44, pinned to the original 60 names; the rest in **R29b** (before ADR-026 R7 and the pen test) |
| R30 a, b | Reversal of a reasoned manual control journal exempt only when its lines mirror the original; one "visible character" rule (D-23): DB CHECK and invariant ≥ 1 visible code point, service 6–500 visible and ≤ 500 code points, NUL refused; new `CONTROL_REASON_INVALID` invariant incl. recurring templates; V76 `NOT VALID` |

## Reviews (`docs/agents/fix-be/`)
- Round 1: Opus FIX (3 MEDIUM: R29 two allowlist entries against D-18, R10 combined filter), Fable security FIX (1 MEDIUM: allowlist package rule let a new cross-company method through, proven in a scratch copy; 4 LOW). No HIGH. Fable: no live cross-company leak, no double posting, no way to hide a manual control posting.
- Round 2 (all fixed, a test per MEDIUM old FAIL / new PASS): Fable ACCEPT (attack re-run: 2 tests now fail on it); Opus FIX on the round-2 reason rule (lead's instruction over-reached) → D-23.
- Rounds 3–4: Opus 1c ACCEPT; Sonnet 3 FIX (NUL → 500) → fixed; Sonnet 3b ACCEPT.
- Rebase onto `4b924f08` (conflicts in the ratchet test, baseline and verify.md, resolved by the builder keeping both lanes' rules): Sonnet 2e ACCEPT; Opus 1d FIX (the edited R34 cap test allowed 16 new names) → pinned the 60 original names; Opus 1e ACCEPT, Sonnet 2f ACCEPT.

## Full run (`scripts/verify.sh --range 4b924f08..HEAD --reviews review-1e-opus.md review-2f-sonnet.md`, 54 min)
**`verify: OK`**, marker `build/verify/a50eabbb….ok`: **4318 tests, 0 failed, 59 skipped** (16 modules; skips unchanged), risk RISK, **REVIEWS OK**. Money invariants on the local stack (read-only, run again by the lead): **OK, 9 companies, 25 posted journals, 73 lines**, no `CONTROL_REASON_INVALID` row, so V76 may be applied to the local stack (ACC-R27).

## API changes for the App lanes (App B)
TB `OUTSIDE_FILTER` → `OTHER_BRANCHES` + `NO_BRANCH` (the latter only with branch as the only filter); GL lines gain `costCentre`, `project` `{id, code, name}`; import list gains `discardedByName`, `discardedAt`; `FILE_ALREADY_IMPORTED` gains `importId`, `importedAt`, `importedByName`; recurring month text "nov 2026" (App mirror test); SIE branch wording App-side; control reason: whitespace/invisible-only → 400, > 500 code points → 400 `too_long`, NUL → 400 `invalid`, old short reason at submit/post → 422 `CONTROL_REASON_REQUIRED {reason: INVALID, min, max}`; the App sends null or "" for "no reason".

## Migration
`V76__control_posting_reason_not_blank.sql` (new file, `NOT VALID` CHECK). V73 and V75 stay permanent gaps; approval limits S5 takes the next free number (D-20).

## Write-scope check
`services/accounts-service/**`, `scripts/money-invariants.*`, `architecture-tests/**`, `docs/risk-paths.txt`, `docs/api/accounts-a1/a2/a4.md`, `docs/database/db-design.md`, `docs/modules/accounts/{recurring-journals,reports}.md`, `docs/operations/{verify,hosting-and-go-live-requirements}.md` (ACC-R27), `docs/agents/fix-be/**` (QA evidence deleted). No AI attribution (checked all 35 commits).

## Docs pages
Developer: `docs/api/accounts-a1.md`, `accounts-a2.md`, `accounts-a4.md`, `docs/database/db-design.md`, `docs/modules/accounts/recurring-journals.md`, `docs/modules/accounts/reports.md`, `docs/operations/verify.md`, `docs/operations/hosting-and-go-live-requirements.md`. User guide: none (backend lane; the App lanes update the user pages for the changed screens).

## Follow-ups
R29b (39→ the 44 left, AuthzQueryRepository pin to AuthzService, notification-attempts platform read, sub-interfaces not named *Repository/*Port, direct adapter injection); the App items above (App B); delete the stale `phase/4-b2-fix-be` remote branch.

## For Jabran
Verdict (lead's call: MERGE into BE `phase/4`).
