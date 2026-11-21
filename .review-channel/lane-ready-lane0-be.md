# Lane ready: Lane 0 BE (machine gates) — 2026-11-21

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-lane0-be` (pushed, remote = local `5e00b131`). Merge target: `phase/4`.
**Range:** `e36b6c6a..5e00b131` (25 commits).
**Brief:** `docs/agents/lane0-gates/brief-be.md` on the branch. Approved: Jabran 2026-11-21 (QA batch 2, Lane 0 first).
**Builder:** Opus 5.5. **Reviewers:** Opus 5.5 (fresh) and Fable 5.2 with /security-review by hand (second, independent: lane diff and brief only, never the other review).

## Reviews (`docs/agents/lane0-gates/` on the branch)
- Round 1: `review-1-opus.md` FIX (7); `review-2-fable-security.md` FIX (1 HIGH, 4 MEDIUM, 4 LOW). Fix list: `fix-list-round1.md`.
- Round 2, fixes only: `review-2b-fable-security-round2.md`; whole-lane ACCEPT pair at `fbcb8d99`: `review-final-opus.md`, `review-final-fable-security.md`.
- Round 3, fixes only, after the full-run comparison below found two verify.sh defects: `review-3-opus-verify-fix.md` and `review-3-fable-security-verify-fix.md`, both **ACCEPT**, Reviewed `529141b4`, Range `e36b6c6a..529141b4`. Both flagged allowlist reason texts that named the wrong cases (LOW); fixed in `529141b4` and re-checked by both.
- These two round-3 files are the pair the verify marker below records (path + sha256).

## Old command vs verify.sh (Jabran: "put both outputs in the lane-ready file, including the skipped-test count")
Same clean worktree. Old run on `3caadc50`; verify on `3caadc50` (failed) and again on `5e00b131` (passed). The only changes between them: `09f231c6` (verify.sh printing fix + 2 allowlist lines + 1 regression check), `529141b4` (reason text), `5e00b131` (review files). No production or test code changed, so the old run's result holds for the final head.

| Module | Old `./gradlew test --continue` (3caadc50) | verify.sh (5e00b131) |
|---|---|---|
| architecture-tests | 47 / 0 / 0 | 47 / 0 / 0 |
| services/accounts-service | 2126 / 0 / 4 | 2126 / 0 / 4 |
| services/api-gateway | 54 / 0 / 0 | 54 / 0 / 0 |
| services/audit-service | 83 / 0 / 6 | 83 / 0 / 6 |
| services/auth-service | 123 / 0 / 0 | 123 / 0 / 0 |
| services/hr-service | 123 / 0 / 6 | 123 / 0 / 6 |
| services/org-service | 514 / 0 / 6 | 514 / 0 / 6 |
| services/payroll-service | 57 / 0 / 8 | 57 / 0 / 8 |
| services/user-service | 654 / 0 / 4 | 654 / 0 / 4 |
| shared/approval-model | 63 / 0 / 0 | 63 / 0 / 0 |
| shared/dimension-contracts | 2 / 0 / 0 | 2 / 0 / 0 |
| shared/domain-events | 104 / 0 / 0 | 104 / 0 / 0 |
| shared/entitlement-catalog | 12 / 0 / 0 | 12 / 0 / 0 |
| shared/file-store | 53 / 0 / 15 | 53 / 0 / 15 |
| shared/neoerp-security | 198 / 0 / 10 | 198 / 0 / 10 |
| shared/tenant-security | 9 / 0 / 0 | 9 / 0 / 0 |
| **Total** (tests / failed / skipped) | **4222 / 0 / 59**, Gradle exit 0, 2347 s | **4222 / 0 / 59**, Gradle exit 0, 2288 s |

Both runs use `-q`, which prints no "BUILD SUCCESSFUL" line: success is Gradle exit 0 with no `FAILURE:`/`BUILD FAILED` in either log (checked), plus 0 failed in the JUnit XML. Logs: old in the lead scratchpad; verify at `build/verify/5e00b131…-20261121-032633.log`.

**What the comparison caught (verify.sh on 3caadc50: FAILED (2), no marker):**
1. `LibraryTierOneContractTest` (5 skips) and `LibraryReadOnlyExemptContractTest` (3) were missing from the skip allowlist. The old run skips them too; they are FirstPartyTokenContract assumption skips, and each skipped case runs in a sibling Library class (both reviewers checked the XML and the overrides). Added with exact counts.
2. The risk lines were printed through `sed "s/^/  risk $range: /"`, which broke on the `/` in `origin/phase/4..`: risk lines lost, sed error, exit code not affected. Replaced by a `printf` loop. Regression check in `verify_default_range_is_the_shared_phase_branch`: **FAIL on the 3caadc50 verify.sh, PASS on the fix** (lead and the Opus reviewer both ran it).

**verify.sh on 5e00b131: `verify: OK`**, marker `build/verify/5e00b131….ok`: `tests=4222 failed=0 skipped=59 modules=16`, `range=e36b6c6a..5e00b131`, `risk=RISK` (19 gate paths, listed in the log), `REVIEWS OK`, `reviews=` the two round-3 files with sha256, `db=neoerp-postgres/neoerp_accounts`.

## Money invariants on a seeded stack (Jabran: "show … a money-invariants run on a seeded stack with posted journals")
Seeded without reset: `make-demo-tokens.sh` (local only, files never opened) → `seed-demo-accounts.sh` → `seed-demo-phase3.sh` → `seed-demo-a4.sh`. Then, inside verify: **`money invariants: OK (9 companies with books, 25 posted journals, 73 journal lines checked)`**. Before seeding, the ledger was empty; the script now fails on 0 posted journals unless `--allow-empty`.

## Targeted tests
- `:architecture-tests:test` 47 / 0 / 0; accounts `MoneyInvariantsTest` 8 / 0 / 0 (reviewer re-ran from clean at fbcb8d99).
- `scripts/risk-check-test.sh`: 25 PASS, 0 FAIL at 5e00b131. Against the 861a85a3 copy: 19 FAIL (every round-1 regression fails on the old code), plus the round-3 check above.

## Write-scope check (`git diff --name-only e36b6c6a..5e00b131`)
`scripts/{verify.sh, verify-skip-allowlist.txt, install-hooks.sh, money-invariants.sh, money-invariants.sql, risk-check.sh, risk-check-test.sh, seed-demo-accounts.sh, seed-demo-phase3.sh, seed-demo-a4.sh}`, `.githooks/pre-push`, `.github/workflows/services-test.yml`, `docs/risk-paths.txt`, `docs/operations/verify.md`, `AGENTS.md` ("Before push"), `architecture-tests/**` (build file, `TenantRepositoryArchitectureTest.kt`, `FrozenTenantBaselines.kt`, `fixtures/ratchet/RatchetFixtures.kt`, `tenant-classification-baseline.txt`), `services/accounts-service/src/test/.../invariants/MoneyInvariantsTest.kt`, `docs/agents/lane0-gates/**`. All in scope; no production code. No AI attribution (checked).

## Docs pages
- **Developer:** `docs/operations/verify.md` (new: how to run verify, marker fields, allowlist rules, hook, accepted limit); `AGENTS.md` "Before push".
- **User guide:** none: no user-facing change (build and review gates only).

## Accepted limit and follow-ups
- The pre-push hook trusts a hand-written marker with the right sha/base/risk/reviews; branch protection and CI close it later (both reviewers agreed).
- Hook guards only `main` and `phase/<number>` (old-Mac point 1); lane branches push freely; verify required before merging into `phase/4`.
- **R29** (fix-list): 60 unclassified repos/ports in the tenant ratchet, BE fix lane batch 2, may only shrink, empty before RLS / first customer.
- **R30** (fix-list): CONTROL_POSTED_OUTSIDE reversal and reason gaps, `gradle/**`/`gradle.properties`/`buildSrc/**` not in risk-paths, ratchet scans only `*Repository`/`*Port`, hook doesn't re-hash review files. Round-3 INFO notes added as R30 (f): allowlist per class, not per case name; `risk-check.sh:148` range before `--`.

## After MERGE
Merge to `phase/4`, run `scripts/install-hooks.sh` in Jabran's checkout (approved), then App Lane 0 (`phase/4-b2-lane0-app`) with the same old-jvmTest vs verify.sh comparison.
