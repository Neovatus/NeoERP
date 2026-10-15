# To the implementer (appended by the reviewer)

> Older entries: `to-implementer-archive-2026-10.md` (read only when an entry refers to them).

## 88 · 2026-10-08 · reviewer · design gate: contract AND rig approved before any build (Jabran)
New rule in `WORKFLOW.md` → Checkpoints: **no slice starts implementation (backend included) until both its contract and its rig are approved.**
- **For A1:** finish CP-A1.1 as planned. It is only the scripts, demo data and the BA-8 order fix, with no new API. **Don't add or change any A1 API** until Jabran has approved the A1 rig. If the rig review changes what the screens need, I'll write a numbered amendment and it lands with CP-A1.2.
- **After CP-A1.1:** stop A1 work and take nothing new from Accounts. Only backlog items that touch no Accounts API are allowed while the rig is pending.

## 89 · 2026-10-08 · reviewer · CP-A1.1: accepted on two conditions
Range a357ea6..9d1dd94 is accepted in substance:
- the BA-8 order matches the server;
- the machine scenario SKIPs until a real client exists, with tokens over stdin;
- the seeder never posts a JV as the Owner, re-runs are safe, and it is opt-in;
- the new personas use standard roles.
Good catch on the five Haiku blockers in rework.

**Two conditions before push:**
1. **Run it live on a throwaway stack.** Scripts that have never run aren't verified. Bring up an isolated stack (its own Postgres and ports, not Jabran's running services), then run the seeder with `NEOERP_SEED_A1_JOURNALS=1`, then `a1-acceptance.sh`, then a short `a1-load.sh`. Report pass, fail or skip per scenario (counts only, per the test-output rules). Fix anything that fails, then push.
2. **Explain the accounts test count.** Entry 92 reported accounts **362/0** at cfb84c1. This table says **348 run + 3 skipped**. Which tests disappeared or were skipped, and why? If any were lost by mistake, restore them.

**Backlog (fine):**
- the BOOKS_NOT_LIVE hint-position test (needs a not-live fixture);
- the auth-service JWKS test (skip when :8083 is down).

**After the push, CP-A1.1 is closed** and A1 stops until Jabran approves the rig, as you said.

## 90 · 2026-10-08 · reviewer · context-limit rule (Jabran, 2026-10-08)
`WORKFLOW.md` has a new section, **"Context limit"**. At about 80 % of your context:
- finish the current small step;
- write `.review-channel/handoff-implementer.md` (≤ 60 lines; replace it, don't append): checkpoint, done, in progress, the exact next step, open entries, anything uncommitted;
- then start a fresh session ("Read WORKFLOW.md and .review-channel/handoff-implementer.md, then continue") or run `/compact`.
Never run into automatic compaction mid-wave. Hand off at the CP-A1.1 boundary if you're above about 60 %.

## 91 · 2026-10-08 · reviewer · correction to 90: compact the context, don't restart the session
At about 80 %:
- update `.review-channel/handoff-implementer.md`;
- run **`/compact`** with a focus line, e.g. `/compact keep: handoff-implementer.md, current checkpoint, open entries`;
- then re-read `WORKFLOW.md` and the handoff before continuing.
A fresh session is only needed if quality drops after several compactions. `WORKFLOW.md` → "Context limit" is updated.

## 92 · 2026-10-08 · reviewer · CP-A1.1 ACCEPTED — push
- **Conditions 1 and 2 are met.**
  - The live run passed: 88 ok, 1 expected skip, and the seeder re-run is identical.
  - The count is 348, with nothing lost.
  - The two script fixes (9d1dd94..d84a2bc) are accepted. The A0-after-V10 acceptance fix was a real catch.
- **§9 miss (p95 251 ms, 16.9 posts/s): push.** Record it as a known open item, not a pass:
  - Backlog: "A1 §9 throughput on a representative host. Report the time held under the journal-sequence lock vs the total. Note: per (company, journal type) throughput is capped at about 1 / (sequence-lock hold time), and the lock is held through the line inserts, the balance upserts and the commit. If ≥ 50 posts/s per company still misses on a real host, propose an amendment (e.g. take the number as late as possible), via me, after the rig gate."
  - Change `a1-load.sh` so a §9 miss reports `TARGET_MISSED` with exit 3, separate from correctness failures (exit 1). Correctness (gapless, balances, TB zero) stays a hard failure.
- **After the push, CP-A1.1 is closed. A1 is paused until Jabran approves the rig.**
- The `/compact` note is fine: ask Jabran when you're at about 80 %.

## 93 · 2026-10-08 · reviewer · CODEX job assignment (test hygiene) + file ownership
Jabran is using Codex as a second implementer for small backlog jobs while A1 is paused. **Claude implementer: do not touch the files below until I post that Codex is done.** Codex reports in `to-reviewer.md` like any implementer (prefix `codex ·` in the entry title).

**Codex owns these files only:**
- **X1** `NeoERP-BackEnd/services/auth-service/src/test/kotlin/com/neovatus/auth/configuration/security/SessionHardeningIntegrationTest.kt`: the bearer-refresh case must use the test server's own port/JWKS, not `localhost:8083` (backlog line 58).
- **X2** `NeoERP-App/composeApp/src/jvmTest/kotlin/com/neovatus/neoerp/app/core/network/NeoErpAuthRuntimeTargetTest.kt`: skip (JUnit assumption) when the local stack on :8083 is down (backlog line 55).
- **X3** `NeoERP-App/composeApp/src/commonTest/kotlin/com/neovatus/neoerp/app/core/network/SessionHardeningTest.kt`: make it order-independent by resetting or isolating `NeoSessionRefreshStatus` state per test (backlog line 52). Test code only. If production code must change to allow a reset, stop and ask.
- **X4, investigation only, no code:** can iOS (Ktor Darwin / NSURLSession) resend the refresh POST after a connection failure? Read `NeoErpNetworkRuntime.ios.kt` and the Ktor Darwin engine config. Answer with evidence, and propose a fix plus a test as a channel entry. Don't implement it: auth changes need Jabran's approval and Opus.

**Rules:**
- **Tests only:** no production code in X1–X3.
- Follow `WORKFLOW.md`: impact-based tests, `-q` logs to file, counts only.
- One commit per job, with the commit identity in `WORKFLOW.md`.
- **Do not push.** Post one entry listing the commits and test counts; an Opus review checks it, then the Claude implementer or Codex pushes after my OK.
