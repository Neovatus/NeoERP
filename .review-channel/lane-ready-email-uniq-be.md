# Lane ready: EMAIL-UNIQ-BE (unique, case-insensitive email on iam.users) — 2026-11-22

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-email-uniq-be`, pushed, head `233fdacb`. It sits on BE `phase/4`
`9aca6c76`. **Rebase pending:** `phase/4` is now `df80e554`, after RISK-NARROW-BE. The lead rebases it once, on the old
Mac's ring, after R29b-3U and AL-REST-BE. The base move touches no user-service file.
**Brief:** `docs/agents/email-uniq/brief.md`. Approved by Jabran (D-46u item 2; migration V50 approved).
**Review tier 1.** The lane is RISK because it touches user persistence. Until GATE-3 the gate needs two gate files, so
a second Opus seat was added. Decisions: D-50.
**Builder:** Opus 5.5, default effort. Report: `docs/agents/email-uniq/builder-report.md`.

## Review files (gate format)
- `docs/agents/email-uniq/review-2-opus.md` (Opus 5.5, fix check) and `review-3-opus-sec.md` (Opus 5.5 security,
  D-43). Both say ACCEPT, Reviewed `19068976`, Range `9aca6c76..19068976`. `risk-check.sh --reviews`: **REVIEWS OK**.
- History: `review-1-opus.md` asked for one fix (1 MEDIUM: a same-id create race gave a 500), and it is closed.

## What it does
- **Duplicate check:** a read-only count on the local `neoerp_iam` found 0 duplicates, ignoring case, surrounding
  spaces and blank emails.
- **`V50__users_email_unique.sql`:** a unique index `ux_users_email_normalized` on `lower(btrim(email))`, for
  non-blank emails only. It is additive and leaves V1–V49 untouched.
- **Clashes:** an email clash gives the existing 409 "Another account already uses <email>". This covers the index and,
  on a create that has an email, the same-id `users_pkey` / `uq_users_idp_subject` collision. No other violation maps.
  The Kotlin pre-checks are kept.
- **Lookup:** `findByEmailIgnoreCase` matches `lower(btrim(email))`, the same as the index.
- **No new oracle:** the 409 uses the email-change check's existing words. R29b-3U's `PERSON_NOT_AVAILABLE` applies
  only to adding a person by id.

## Tests (builder on this Mac; reviewers did not re-run them, D-49)
- Six new tests fail on the old code and pass now: the email-case and space duplicate, the email-change race, the
  same-id create race, the spaced lookup, and V50 on top of V49.
- Full user-service suite 694/0/4 skipped; `:architecture-tests` 89/0, both on `19068976`.

## For the old Mac
1. On your ring, I rebase onto the then-current `phase/4` and re-stamp, then ring you back.
2. Run `verify.sh` with the two review files (no wrapper).
3. No simulator step is needed. The visible change is only that a race now answers 409 instead of 500.

## Docs pages
- Developer: `docs/database/db-design.md` (the index and the duplicate query) and `docs/api/user-iam.md` (409 on a race).
- User guide: none, because no message changed.

## Follow-up rows
- **For the R29b-3U rebase:** when two invites race, the losing inviter now gets the 409 "account exists". Decide
  whether to keep the 409 or retry and reuse the account.
- An id or subject clash on a create that has nothing to do with the email gets a misleading email-taken 409. This is
  rare: identity ids are provisioned.
- **Escaped defect** (logged): `PATCH` with email `""` clears the email without the Keycloak sync.

## Timeline (new Mac; L37 style A, one small lane)
- Brief at 15:20; lane-ready at 16:35, about 1 h 15 m wall time.
- **Build:** 16 m. **Rework:** 12 m. **Review:** Opus 4 m + 1 m, second seat 2 m.
- **Test:** inside the build. **Waiting:** about 40 m (gaps between hand-backs).
- **Size:** 14 files (+710 / −7), 5 items, 1 fix round, 0 fix-caused findings.
- **Tokens:** builder about 167 k; Opus about 125 k; second seat about 84 k.
