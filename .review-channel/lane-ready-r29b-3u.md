# Lane ready: R29b-3U (company isolation for the rest of user-service; the R29b cap reaches 0) — 2026-11-22

**Repo / branch (current):** `NeoERP-BackEnd`, `phase/4-b2-r29b-3u-r2`, pushed, head `1c0fc25c`, on BE `phase/4` `6d948693` (AL-REST-BE merged). The rebase was all `=`, but it was a **semantic merge break**: AL-REST-BE's `CompanyHolderReader.companyRoles` called the old unscoped `findUsersByIds`, so it did not compile. Both seats caught it. Fixed in `81b9f591` (scoped `findByIds(scope, ids)`). That run's own Gradle output: BUILD SUCCESSFUL, exit 0, user-service 737/0/4 (incl. DecideRolesTest), `:architecture-tests` 92/0. Gate files: `review-3u-7-opus.md` + `review-3u-8-opus-sec.md`, ACCEPT, Reviewed `81b9f591`, Range `6d948693..81b9f591`, REVIEWS OK.
**Was:** `phase/4-b2-r29b-3u-r`, head `f2f469f9`, on BE `phase/4` `df80e554`
(R29b-5, OUTBOX-CLAIM-BE and RISK-NARROW-BE merged). The rebase rewrote 5 commits, mostly to merge R29b-5's
architecture lists, and added one test fix. Both seats checked those commits, and the rest are `=`.
**Brief:** `docs/agents/r29b/brief-3u-user-rest.md`. Approved by Jabran 2026-11-22 (D-25 with Fable's conditions;
trial B). Lead decisions D-37, D-40, D-41, D-46u and D-47u, with **Jabran's answers**:
- direct add becomes an invitation;
- the enrollment owner is kept and audited;
- the email index goes to its own lane, EMAIL-UNIQ-BE.

**Builder:** Opus 5.5. Report: `docs/agents/r29b/builder-report-3u-user-rest.md`.
**Security / company-isolation lane: RISK, tier 2.** Fable was paused, so the reviews are two independent Opus seats
(D-43) at high effort. Both said FIX in round 1 (0 HIGH; seat B found two real cross-company MEDIUMs). Both accept
after one fix round and after the rebase.

## Review files (gate format; the gate reads these two)
- `docs/agents/r29b/review-3u-5-opus.md` (Opus 5.5) and `review-3u-6-opus-sec.md` (Opus 5.5 security, D-43): ACCEPT,
  Reviewed `be061cfd`, Range `df80e554..be061cfd`.
- `risk-check.sh --reviews`: **REVIEWS OK**.
- History: `review-3u-1-opus.md` (FIX 2M/6L), `review-3u-2-opus-b.md` (FIX 3M/5L), `review-3u-3-opus.md` and
  `review-3u-4-opus-sec.md` (ACCEPT on `fa045702`).

## What it does
- **All 18 entries are classified.** The baseline file and `UNCLASSIFIED_2026_11_21` are empty, and
  **`MAX_UNCLASSIFIED` = 0**. With R29b-5 merged, the pen test's gate condition (D-25 Q7) is met.
- **`UserRepository` and `PlatformStaffRepository` are deleted.** They are replaced by id-only and boolean-only ports,
  pinned by method and frozen. The staff mark is a required port that fails closed.
- **Fixes from review round 1:**
  - withdrawing an invitation no longer closes an account that another company still needs;
  - scoped staff People shows another company's person only through an accepted membership;
  - the enrollment owner needs the machine scope, and `createAs` is deleted;
  - Super Admin grant and revoke run under one lock and write `PLATFORM_WRITE` first.
- **One refusal for company admins:** an add for someone unknown, someone outside the company, Neovatus staff, or a
  staff email answers `409 PERSON_NOT_AVAILABLE`, "This person can't be added here; invite them by email".
- **The platform-write audit is required:** `record` refuses outside a transaction, and own platform access checks
  id = identity.
- **R29b-2 follow-ups** F1 to F5, Fable N1 to N3 and Opus N1 are done. `franchisesOf` is limited to user-service's
  machine client, and its nullable field fails with 503. **Org deploys first.**

## Answers that changed (full list and App retests in the report)
- People, platform, onboarding, stand-in and employee-link by-id reads: 404 outside the reach, 403 inside it, 503 on a
  reach failure.
- Company-admin adds: the single 409 `PERSON_NOT_AVAILABLE`.
- Super Admin grant/revoke and staff writes: 503 when the audit cannot be written.
- **App retest:** the not-found and "can't be added here" messages.

## Tests on this Mac (Java 21, BE lock, Docker up; real-DB tests executed)
- **Builder after the rebase:** user-service 733/0/4 skipped, org-service 626/0/6, `:architecture-tests` 91/0 (after
  `be061cfd`).
- **Old FAIL / new PASS:** 6 HTTP tests fail on `409f45e5`; 12 fix-round tests fail on `e6ac1344`. The 13 real-DB
  two-company cases ran.
- **Opus seat A full re-run before the rebase:** user 732/0/4, arch 85/0.
- **Not run here:** the whole suite, the money invariants, the jar start.

## For the old Mac
1. Check the two review files.
2. Run `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/r29b/review-3u-7-opus.md docs/agents/r29b/review-3u-8-opus-sec.md`
   with no wrapper.
3. Jar-mode start: 8 healthy. **Org-service starts before user-service** (N2).
4. Give the verdict and merge. **After the merge**, the lead deletes `docs/agents/r29b/evidence/` (D-37 item 3).
5. Add these **release-gates / backlog rows** in the merge commit or the next docs commit:
   - "The company-enrollment owner accepts before go-live" (D-46u).
   - An arch rule so that only the adapter reaches the internal `save`/`findById`.
   - Pen-test list:
     - staff-email signals on invite-by-email (409 before the IdP call);
     - the security page and the email-change rule refuse a staff target faster.
   - Decide whether the losing inviter in an invite race keeps the 409 or the account is retried and reused (from
     EMAIL-UNIQ-BE).

## Docs pages
- **Developer:**
  - `docs/adr/ADR-012-tenant-query-isolation.md` (§2 and §3 notes; both lanes kept);
  - `docs/api/user-iam.md` (the changed answers, the 409);
  - `docs/api/org.md` (`franchisesOf`).
- **User guide:** the "can't be added here" text is new, and it is in the App retest list.
- `docs/agents/r29b/evidence/` is still there; the lead deletes it after the merge.

## Timeline (new Mac; Europe/Oslo; L37 style B, in parallel with R29b-5)
- **Assigned:** trial B. The brief was written at 09:17; the lane was ready at 17:10.
- **Build:** about 82 m in step 1 (18 entries), plus about 52 m in step 2 (D-40/D-41 conditions, the last two entries).
- **Rework:** about 45 m in fix round 1 (D-47u), plus about 22 m for the rebase and the arch conflict merge.
- **Review:**
  - D-40 decision check (Fable) about 5 m.
  - Round 1: seat A 8.6 m, seat B 12 m.
  - Fix checks: A 5.4 m, B 2.4 m.
  - Rebase checks: A 2.1 m, B 2.4 m.
- **Test:** inside the build and rework (full suites three times).
- **Waiting:**
  - for Jabran's three answers;
  - for the D-40 check;
  - in the merge queue behind R29b-5, OUTBOX-CLAIM-BE, RISK-NARROW-BE and AL-REST-BE.
- **Size:** 187 files changed (+7,474 / −1,999). 18 entries, plus 8 follow-ups. 1 fix round. 0 fix-caused findings above
  LOW. 5 rows.
- **Tokens:** builder about 1.1 M over all steps; seat A about 460 k; seat B about 420 k.
