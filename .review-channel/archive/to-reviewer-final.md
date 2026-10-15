# To the reviewer (appended by the implementer)

> Older entries: `to-reviewer-archive-2026-10.md` (read only when an entry refers to them).

## 94 · 2026-10-08 · implementer · review-request: backlog checkpoint — audit side-effect-free caller identity (78.3)
- NeoERP-BackEnd `dev` (local): `review cfb84c1..a357ea6`. Security-flagged, so your round, then push.
- **Design (smallest):** user-service's `/api/lifecycle/decision` already sends `userId`, and `decide()` is read-only. The library's `UserLifecycleDecision` gains `userId: String? = null` (additive; only audit reads it). Audit's new `AuditCallerIdentity` reads it from the accepted decision on `UserLifecycleFilter.DECISION_ATTRIBUTE` (this request, this token, no cache). It makes no call to `/me`, so no row writes, no last-seen stamp and no invite acceptance. Missing, refused, wrong-contract or non-UUID → 503 `AUTHZ_UNAVAILABLE`; USER_NOT_FOUND and PENDING are still 403 by the filter. No new endpoint, no wire change, one fewer user-service call per request.
- **Tests:**
  - `LifecycleDecisionReadOnlyIntegrationTest` (real DB: row, last_login_at, user count, invitation and membership unchanged; a control shows `/me` does write);
  - `AuditCallerIdentityTest` (7) and `AuditCallerScopeTest` (15, incl. "the lifecycle decision is the only user-service call").
  - Full run across every module (the library changed): everything green except one auth-service test, `SessionHardeningIntegrationTest` bearer-refresh, which needs a live :8083 JWKS. auth-service doesn't depend on the library and isn't touched (independent review confirms); it's in the backlog.
- **Independent Opus review: cherry-pick, no findings.** It confirmed the attribute can't be injected or reused across requests. For platform staff in an Enter-company session, `userId` is their own IAM id, so they see their own notifications, as before.
- Docs: platform.md (the notifications and workflow-inbox Auth sections) and user-iam.md (lifecycle decision `userId`).
- **Also ready (CP-A1.1):** S6 acceptance and load scripts (Opus, a79b9a5) plus Haiku demo journals, route check and docs (d65485f). Kystgruppe lacks an Accountant and a Finance Manager, which the two-person scenarios and the demo journals need; the Haiku worker is adding them with standard roles. Then the S6 Opus review and the CP-A1.1 entry.

## 95 · 2026-10-08 · implementer · review-request: CP-A1.1 (backend complete) — S6 scripts, demo data, BA-8 order
- NeoERP-BackEnd `dev` (local): `review a357ea6..9d1dd94`. Risk-flagged (two-person rule demo, acceptance and load scripts): your round, then push. Audit (94) is pushed (a357ea6), per 87.
- **Acks:** 87 (rulings; 503 kept; audit pushed) and 88 (design gate). After this checkpoint A1 stops. I'll take nothing from Accounts, only backlog items with no Accounts API, until Jabran approves the rig.
- **Commits:**
  - 8afa36e **BA-8 order**, per 87: PLATFORM → PERMISSION → BOOKS_NOT_LIVE → JOURNAL_STATE → TWO_PERSON_RULE → the rest. `JournalPolicy.actions` and the §20 BA-8 text are updated. The order test now expects PLATFORM for a platform person with or without the code. No new API. Gap: no hint test for the BOOKS_NOT_LIVE position (the harness has no not-live books fixture); add it, or leave it for the backlog?
  - d423930 `a1-acceptance.sh` and `a1-load.sh` (Opus). The machine scenario SKIPs with exit 2 until a real posting client exists (BA-2). Tokens go over stdin, never argv.
  - f9dc599, 1d942c2, 88ec38f, 9d1dd94 cover four things:
    - **Gateway routes and route-check:** journal routes added, and the offline route-check test passes 14/14.
    - **New users:** the Kystgruppe Accountant Anna Lindh (`IAM.ACCOUNTANT`) and Finance Manager Bjorn Eriksson (`IAM.ACCOUNTS_ADMIN`), seeded the same safe-to-rerun way as the existing personas.
    - **Demo journals:**
      - opt-in through `NEOERP_SEED_A1_JOURNALS=1`; `a0-acceptance.sh` forces 0;
      - each JV: the Accountant creates and submits, the Finance Manager posts and reverses;
      - the Owner's OB: posted by the Owner with `ownerSelfApproval:true`;
      - without both role tokens the JV steps are skipped, never run as the Owner;
      - re-runs are safe: a create replays to the same draft, and later steps check status first;
      - accounts are picked as in a1-acceptance.
    - **Docs:** `local-demo-data.md` (persona rows; token usage for the seeder and for a1-acceptance).
- **Review trail:** independent Opus review → rework (the first Haiku seeder had 5 blockers: owner token in every role, missing `version`, A0 regression, re-runs aborting, wrong account choice) → Opus re-review: merge. Its MINOR (an exported opt-in leaking into A0) and NIT (the Idempotency-Key is read on create only) are folded into 9d1dd94.
- **Tests, full suites once:** `a357ea6` + BA-8 + scripts, scripts-only after that.

  | Module | Tests | Skipped | Failed |
  |---|---|---|---|
  | accounts-service | 348 | 3 | 0 |
  | user-service | 519 | 3 | 0 |
  | org-service | 308 | 7 | 0 |
  | neoerp-security | 174 | 10 | 0 |
  | hr-service | 111 | 6 | 0 |
  | auth-service | 98 | 0 | 1 |
  | audit-service | 79 | 7 | 0 |
  | api-gateway | 51 | 1 | 0 |
  | payroll-service | 51 | 8 | 0 |
  | architecture-tests | 15 | 0 | 0 |
  | tenant-security | 9 | 0 | 0 |

  - Load and concurrency: PostingConcurrencyLoadTest 3/0, PostingLockOrderTest 7/0, BalancePropertyTest 1/0.
  - The one auth-service failure is the known `SessionHardeningIntegrationTest` bearer-refresh case, which needs a live :8083 JWKS (backlog).
- **Not run live:** a1-acceptance, a1-load and the seeder have not run against a real stack. That needs Jabran's local services, which I don't touch. Jabran can run them (commands in `local-demo-data.md`), or I can on a throwaway stack if you want that before CP-A1.1 closes.

## 96 · 2026-10-08 · implementer · CP-A1.1 conditions (89): live run done; count explained; one ruling before push
- Acks 89 and 90 (context-limit rule; I'm under 60 %, so no hand-off yet).
- **Condition 2, accounts count: nothing lost.** A clean rerun at cfb84c1 gives 64 classes and 348 tests, 3 skipped, the same as now. The 362 in my 92 was copied from a review agent's report without checking. My mistake. "348 / 3 skipped" means 348 in total, with the 3 skips included.
- **Condition 1, live run on an isolated stack.**
  - Setup: Compose project `neoerp-a1verify`; Postgres, Keycloak and services on 127.0.0.1:25432/28080–28088; hr and payroll not booted. Torn down with `down -v` afterwards; Jabran's containers untouched.

  | Step | Result |
  |---|---|
  | `seed-demo-tenants.sh` / IAM | PASS |
  | 4 tokens | PASS |
  | `a0-acceptance.sh` | PASS after fix 2; 0 journals seeded |
  | Seeder with `NEOERP_SEED_A1_JOURNALS=1` | PASS: OB, draft JV, submitted JV, 2 posted JVs, 1 RV |
  | Seeder re-run | PASS: journal table identical by diff |

  - `a1-acceptance.sh`: 88 ok, 0 failed, 1 skip; exit 2.

    | Scenario | Checks passed | Result |
    |---|---|---|
    | 1 | 19 | PASS |
    | 2 | 12 | PASS |
    | 3 | 20 | PASS |
    | 4 | 8 | PASS |
    | 5 | 10 | PASS |
    | 6 Machine posting | – | SKIP (BA-2) |
    | 7 | 2 | PASS |
    | 8 Ledger check | 9 | PASS |

  - Script fixes found by the run, now on local `dev`. The range is `review 9d1dd94..d84a2bc`, scripts only:
    - **Postgres container guard:** the A1 guards accepted only `neoerp-postgres`, so the documented `NEOERP_POSTGRES_CONTAINER` override could never work. They now accept `neoerp(-<name>)*-postgres`; the default is unchanged.
    - **A0 acceptance after A1:** `a0-acceptance.sh` required `accounts.journal_entries` to be absent. A1's V10 recreates that table, so A0 acceptance failed on every database after V10. It now refuses only the legacy V4 shape (has `source_type`, lacks `journal_type`).
  - **`a1-load.sh`:** Sialkot, Owner self mode, 5 warm-up + 100 timed posts of 50 lines, 4 in parallel. 0 errors and 0 refusals; all 105 in the DB; numbers unique and gapless; balances = Σ lines and the TB nets to zero, before and after. **Two §9 targets missed:** p95 251 ms (target ≤150) and 16.9 posts/s (target ≥50). p99 268 ms passes; p50 235 ms. The script exits 1.
    - My read: this is the environment, not a defect. It's a laptop with the local profile, every service plus Keycloak on one machine and other work running. The in-JVM `PostingConcurrencyLoadTest` (3/0) proves correctness under contention, not §9 throughput, and none of the posting code is in this checkpoint. A1 is design-gated, so there's no server change to make now anyway.
- **Ruling needed before push:** may I push `dev` with the §9 miss recorded as environment-bound? If yes, I'll add a backlog item: measure §9 on a representative host, and if it still misses, profile the posting path. That would come after the rig gate. Or do you want §9 met before CP-A1.1 closes?

## 97 · 2026-10-08 · implementer · CP-A1.1 pushed and closed; A1 paused
- NeoERP-BackEnd `dev` pushed: `a357ea6..1f85eb6`. That's the accepted range up to d84a2bc, plus 1f85eb6 per your 92:
  - `a1-load.sh` now treats a missed §9 latency or throughput target as exit 3 `TARGET_MISSED`;
  - a refusal, a duplicate or gapped number, or a ledger or TB difference is still exit 1;
  - the header documents the codes; `bash -n` and a stub check of the classification are done.
- Backlog (`NeoERP/docs/backlog.md`): the §9 item with your wording (sequence-lock hold time vs total; the amendment goes through you after the rig gate), and the BOOKS_NOT_LIVE hint-position test.
- **A1 is paused until Jabran approves the rig.** Next I'll take only backlog items that touch no Accounts API. I'll name each one in a short entry before starting.
