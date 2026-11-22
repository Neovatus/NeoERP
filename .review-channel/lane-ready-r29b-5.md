# Lane ready: R29b-5 (audit-service and auth-service company isolation, the last R29b sub-lane) — 2026-11-22

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-r29b-5-r`, pushed with head `1560d0d6`. It sits on BE `phase/4`
`095a8989`, where AC418-BE is merged. The rebase from `409f45e5` kept all 16 code commits `=`, and the base move
touches no file of this lane. Built and reviewed on the **builder Mac**: targeted tests plus the full suites of the
services it touches.
**Brief:** `docs/agents/r29b/brief-5-audit-auth.md`. Approved by Jabran 2026-11-22 (D-25 with Fable's conditions; trial
B). Lead decisions: D-37, D-40 item 3 and D-42. **Builder:** Opus 5.5 high. Report:
`docs/agents/r29b/builder-report-5-audit-auth.md`.
**Security / company-isolation lane: RISK.** Reviews by Opus (fresh) and Fable. Opus found no HIGH or MEDIUM. Fable said
FIX in round 1 for one text-only MEDIUM, and both accept after one fix round. This lane gates ADR-026 R7 (D-25 Q7).

## Review files (gate format; the gate reads these two)
- `docs/agents/r29b/review-5-7-opus.md` (Opus 5.5) and `review-5-6-fable.md` (Fable 5.2): Verdict ACCEPT, Reviewed
  `980f64df`, Range `095a8989..980f64df`. These are re-stamps for the base move. The commits after `980f64df` hold only
  review files. `risk-check.sh --reviews` on this Mac: **REVIEWS OK**.
- History, in order:
  1. `review-5-1-opus.md`: no H or M, 4 LOW.
  2. `review-5-3-opus.md`: re-stamp after the docs LOWs.
  3. `review-5-2-fable.md`: FIX, 1 MEDIUM (text) and 2 LOW.
  4. `review-5-4-fable.md` and `review-5-5-opus.md`: the fix checks, both ACCEPT on `8f77a276`.

## What it does
- **All 5 entries are classified.** The baseline and `MAX_UNCLASSIFIED` go from 23 to 18. R29b-3U lowers the same
  cap in parallel: whichever lane merges second rebases, and the cap meets at 0 (D-37 item 3).
- **audit-service:** the 4 ports are split by key into 1 tenant-owned, 2 platform-wide and 6 system-list ports. They
  have frozen methods and pins on class and use-case method. Other details:
  - Platform-wide reads are recorded in `audit_events` first, in their own transaction, and answer 503 when the record
    fails (Q5).
  - The notification retry writes `PLATFORM_WRITE` in its own transaction.
  - The machine workflow decide-by-subject finds only the calling producer's own item; the producer comes from the
    token, in the SQL.
- **auth-service:** `StableIdentityLinkRepository` is a system entry keyed by the identity provider's issuer and
  subject. The unused `inventory()` and `findByExternalIdentity` are deleted; neither had a production caller.
- **No auth `PlatformAccessAuditPort` adapter (D-40 item 3):** no platform-wide read is left in auth. ADR-012 and the
  D-25 Q5 list now say the adapter comes with the first such read, and name what enforces that.
- **D-42 item 2:** the machine path refuses `service` or producer `audit-service` with 400 `RESERVED_AUDIT_SOURCE`.
  user-service's and org-service's own `platform-access` events still pass.
- Arch: 6 new rules, each with a fixture offender.

## Answers that changed (full table in the report, "Endpoints whose answer changes")
- A company audit read when user-service cannot answer: 403 → **503**.
- The platform-wide audit read and `GET /api/notifications/{id}/attempts` are recorded first, and answer **503** when
  the record fails.
- The notification retry records `PLATFORM_WRITE` first and answers **503** when it fails; nothing is dispatched. The
  retry row now also shows in that company's own audit list.
- A machine append naming `audit-service` as service or producer: **400** `RESERVED_AUDIT_SOURCE`.
- **App retest:** the audit list shows staff retries, and the notification attempts page.

## Tests on this Mac (Java 21, BE lock, Docker up; real-DB tests ran, none skipped)
- **Builder:** architecture 89/0. Full suites in the fix round: audit-service 106/0/6 skipped (the existing token
  contract markers), auth-service 124/0/0, `:architecture-tests` 89/0/0. Old FAIL: 7 base-signature copies fail on a
  temp checkout of `409f45e5`, and the 2 new D-42 tests fail on `7439b8f1`.
- **Opus re-runs:** round 1 audit 56/0, auth 10/0, arch 89/0. Fix check: `AuditServiceTest` 5, `AuditPlatformAuditHttpTest`
  11 (real DB), `AuditFirstPartyTokenContractTest` 18, `AuditSecurityRuleParityTest` 13,
  `AuditTwoCompanyAdaptersIntegrationTest` 4; all 0 failed.
- **Not run here:** the whole BackEnd suite, the money invariants, the jar-mode start.

## For the old Mac (test Mac)
1. Check the two review files.
2. Run `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/r29b/review-5-7-opus.md docs/agents/r29b/review-5-6-fable.md`
   without a `lockf` wrapper, with Docker up.
3. Jar-mode start: 8 healthy. Then check that the audit and notification pages answer as before for the demo users.
4. Give the verdict and merge under the standing merge.
5. **Release-gates rows** (`docs/operations/hosting-and-go-live-requirements.md`, Gate "before the pen test and before
   R7 is switched on"): please add these in your merge commit or the next docs commit on `phase/4`:
   - R29b-5-F1: the pins check port interfaces only; extend them to adapters and concrete use-case classes, in all
     services.
   - R29b-5-F3: scope-all staff reading another company's trail with `?orgId=` is not recorded.
   - Fable N1: `service` is not bound to the producer, so a service can append rows naming user-service or org-service.

## Docs pages
- **Developer:** `docs/adr/ADR-012-tenant-query-isolation.md` (audit and auth reach, the R7 note, the auth-adapter
  rule), `docs/api/platform.md` (the retry and the reserved source) and the audit/notification API pages listed in the
  report.
- **User guide:** none. No user-visible message changed; the App shows its existing 503 text.
- `docs/agents/r29b/evidence/` stays; the lead deletes it after R29b-3U merges (D-37 item 3).

## Follow-up rows
- F1, F3 and Fable N1, as in item 5 above.
- R29b-5-F2: a real notification sender must send after the commit (Opus note).
- The `docs/api/platform.md` retry paragraph still opens with "a company-less platform write"; it is wording only (Opus).

## Timeline (new Mac; Europe/Oslo; agent times from task notifications; L37 style B, in parallel with R29b-3U)
- **Assigned:** trial B (Jabran, 2026-11-22). The brief was written 09:17 once R29b-2 merged; the lane-ready is 12:51.
  Wall time 3 h 34 m.
- **Build:** 34 m (builder, 10:16–10:51, including its targeted runs).
- **Rework:** 14 m (the docs LOWs 1 m; fix round 1 13 m, including the full suites).
- **Review:** Opus 14.6 m (round 1) + 0.5 m + 5.1 m (fix check) + 1 m (re-stamp); Fable 4.4 m (round 1) + 0.7 m + 0.3 m.
  About 27 m in all.
- **Test:** inside the build, the rework and the Opus runs above.
- **Waiting:** about 139 m.
  - About 60 m for a BackEnd builder slot (AL-REST-BE was building; D-37 item 4).
  - About 35 m before the Fable review, which waited for the D-40 decision check.
  - The rest is gaps between hand-backs while the lead ran four other lanes.
  - One rebase after AC418-BE merged (1 m plus the re-stamps).
- **Size:** 75 files changed (+3,169 / −526) over the base. 5 entries. 1 fix round. 0 fix-caused findings. 3 rows to
  the release gates and 2 small rows.
- **Tokens:** builder about 490 k; Opus about 260 k; Fable about 226 k.
