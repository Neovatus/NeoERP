# Lane ready: R29b-2 (user-service scope resolver and RBAC split, sub-lane 2 of 5) — 2026-11-22

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-r29b-2-r` (pushed, head `409f45e5`). It sits on BE `phase/4` `16d9a3fe`:
GATE-2 is merged, and the rebase kept all 15 commits `=`. Built and reviewed on the **builder Mac** with compile and
targeted tests only.
**Brief:** `docs/agents/r29b/brief-2-user-rbac.md`, together with `brief.md` and the evidence folder (kept until the
last sub-lane). Approved by Jabran 2026-11-22: D-25 with Fable's conditions, Q7 "user resolver + RBAC" with Q4's
catalogue split. Lead decisions D-34 (rule 2). **Builder:** Opus 5.5 high. Report:
`docs/agents/r29b/builder-report-2-user-rbac.md`, which has the fix round and the follow-up rows.
**Security / company-isolation lane: RISK.** Reviews on this Mac by Opus fresh and Fable. Both said FIX in round 1 (no
HIGH; no path to another company's rows), and both accept after one fix round.

## Review files (gate format; the gate reads these two)
- `docs/agents/r29b/review-2-3-opus.md` (Opus 5.5, re-run) and `review-2-4-fable.md` (Fable 5.2): Verdict ACCEPT,
  Reviewed `a198cde5`, Range `16d9a3fe..a198cde5`. The one commit after them holds only these two files.
  `risk-check.sh --reviews` on this Mac: **REVIEWS OK**.
- History: `review-2-1-opus.md` (FIX 0H/3M/6L), `review-2-2-fable.md` (FIX 0H/2M/11L).

## What it does
- **12 of 13 entries classified.** The baseline and `UNCLASSIFIED_2026_11_21` go from 35 to 23, and `MAX_UNCLASSIFIED`
  is 23. `OrgScopeAccessPort` stays for the next lane: most of its methods are multi-company reads for people and
  platform views. On the ratchet lists, system goes from 26 to 34, platform-reference from 0 to 4, and platform-wide
  from 1 to 2.
- **`UserScopeResolver`:**
  - The reach is resolver-minted. Owner lookups return only ids and are pinned to the resolver, both calls and method
    references.
  - Scope-all staff are keyed by the checked permission. A reach failure answers 503, and mutations use a fresh reach.
  - **Franchise reach (D-34):** org-service's new internal facts kind `franchisesOf` is a keyed query on
    `parent_company_id`. User widens a scoped staff member's reach with it and looks up again, bounded in SQL. The old
    `NOT IN (:reach)` lookups are gone, and org down answers 503.
- **Q4 catalogue split:**
  - Each Role, RolePermission and RoleVersion repository is split into a company port and read-only catalogue ports.
    The catalogue ports have frozen methods and a no-write rule.
  - Catalogue writes are keyed by `PLATFORM.CATALOG.WRITE` and pinned.
  - Every role query uses `company_id IS NULL` or `= scope`.
- **Q6:** own memberships are keyed by the token identity, through `OwnPermissionCompanies`, a minted value that is
  never empty.
- **Audit:**
  - Q2: `PLATFORM_WRITE` in the write's transaction, flushed; an audit failure answers 503 and nothing is written.
  - Q5: a user `PlatformAccessAuditPort` adapter records the read first, in its own transaction.
- **R29b-1 follow-ups:**
  - org `hasPermission` answers 503 when user-service fails;
  - `accessibleOrgIds` is deleted.
- **Arch rules:** 7 new ones, each with a fixture offender (listed in the report).

## Answers that changed (wrong or degraded callers only; correct callers get the same responses)
- **Membership by id** (`/roles`, `/overrides`, `/access`, `/exceptions/{id}`, `/status`) and **role by id** (GET,
  PUT, `/permissions`, `/reset`, `/apply-update`, `/dismiss-update`, DELETE), where the row is missing or belongs to
  another company: was 403, now **404**. Inside the reach without the permission it stays 403.
- `POST /roles/{id}/customise` with another company's role: was 422, now 404.
- `POST /access/preview` with another company's membership: was 403, now 404.
- A membership given another company's role: was 422, now 404.
- A standard role with `?orgId=` outside the staff scope: `memberCount` is now null.
- `GET /api/rbac/memberships` and `GET /api/admin/onboarding/invites` without `orgId`: recorded first, 503 when the
  record fails.
- 21 staff and catalogue write handlers: `PLATFORM_WRITE` first, 503 when it cannot be written.
- A franchise row while org is down: was 403, now 503.
- org's by-id endpoints when user-service fails: was 403, now 503.
- **App retest:** the not-found message on a membership or role opened from another company; scope-all staff without
  the platform code get 404 (as in org).

## Tests on this Mac (Java 21, BackEnd lock, Docker up; real-DB tests executed)
- **Builder, fix round 1:** architecture 83/0; user-service whole module 686/0 (4 existing skips); org facts,
  adapter and security 199/0.
  - The base `bf9a5c3d` was tested in a temp worktree, removed afterwards: 7 new arch tests fail there, covering M2,
    item 6 and item 11.
  - The platform-wide read test fails when the audit is set to REQUIRED.
  - The M1 tests cannot compile on the base because the API changed (judged sound by Opus).
- **Opus re-runs:** round 1: architecture 83/0, 11 user classes 62/0, org security 54/0. Fix check: architecture
  83/0, 27 user classes 270/0, 4 org classes 23/0.
- **Not run here:** the full suite, the money invariants, the jar-mode start.

## For the old Mac (test Mac)
1. Check the two review files.
2. Run `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/r29b/review-2-3-opus.md docs/agents/r29b/review-2-4-fable.md`.
   Run it without a `lockf` wrapper, with Docker up.
3. Jar-mode start: 8 healthy. Role and membership pages answer as before for the demo users.
4. Give the verdict, then merge under the standing merge. After the merge, R29b-3U and R29b-5 start from its head
   (trial B), and AL-REST-BE rebases onto it for BE-9.

## Docs pages
- **Developer:**
  - `docs/adr/ADR-012-tenant-query-isolation.md` (user's company-less writes, the franchise lookup);
  - `docs/api/user-iam.md` (the status changes, the audit records);
  - `docs/api/org.md` (the internal `franchisesOf` facts kind, the 503).
- **User guide:** none, because no user-visible message changed; the App shows its existing 404 and 503 texts.
- `docs/agents/r29b/evidence/` is kept until the last sub-lane.

## Follow-up rows (for R29b-3U unless marked)
- F1: the `PersonAuditFanOutPort` key.
- F2: the staff writes that do not record `PLATFORM_WRITE` yet: invitations, person update, onboarding, stand-ins
  and employee links. Extend `PlatformWriteHandlersTest` to those controllers.
- F3: `OrgScopeAccessPort` (entry 13; cap 23).
- F4: `PlatformAuthorityService.reaches` answers 403 on an org outage (Fable L7, the rest of it).
- F5: onboarding by invitation id is still read unscoped by the rules.
- From the fix checks:
  - Fable N1: limit `franchisesOf` to user-service's machine client (accounts, hr and payroll can ask today).
  - Fable N2: a missing `franchises` field reads as none, so make it nullable and fail with 503, and deploy org first.
  - Fable N3 / Opus N1: tests of their own for the resolver's role path, the L1 bound, the L8 check, and the
    `franchisesOf` wire between user and org.

## Timeline (new Mac; Europe/Oslo; agent time from task notifications; L37 style A: R29b-1, then R29b-2)
- **Assigned:** the R29b sub-lane order (D-25 Q7). The brief was written once R29b-1 was lane-ready.
- **Build:** about 3 h 19 m for 13 entries, including the builder's targeted runs.
- **Rework:** fix round 1 (D-34), about 32 m, including the org `franchisesOf` lookup.
- **Review:**
  - Opus: round 1 11.4 m, fix check about 5.7 m.
  - Fable: round 1 12.8 m, fix check about 4 m.
- **Test:** inside the build, rework and Opus runs above (targeted only).
- **Waiting:**
  - The two reviews ran in parallel with each other and with other lanes' work.
  - The rebase onto GATE-2 took about 1 m.
  - The lane waited about 15 m between the fix-round hand-back and the fix checks (the lead was busy on GATE-2).
- **Size:** 181 files changed (+9,116 / −2,978) on the base. 13 entries (12 classified). 1 fix round. 0 fix-caused
  findings above LOW. 5 follow-up rows plus 4 LOW rows passed to R29b-3U.
- **Tokens:** builder 888 k (build) + about 220 k (fix); Opus 379 k; Fable 469 k.
