# Lane ready: GATE-3a (a review survives a clean rebase) — both repos — 2026-11-22

> Principles: `docs/PRINCIPLES.md` (D-63).

| Repo | Branch | Head | Reviewed base | Gate files (gate format) |
|---|---|---|---|---|
| BE | `phase/4-b2-gate-3a-be` | `f863678c` | `df80e554` | `docs/agents/gate-3a/review-3-opus.md` + `review-4-opus-sec.md`: ACCEPT, Reviewed `93d4ff0d` |
| App | `phase/4-b2-gate-3a-app` | `0068c6ab` | `3fc42d32` | `docs/agents/gate-3a/review-3-opus.md` + `review-4-opus-sec.md`: ACCEPT, Reviewed `6e2f72ef` |

**Rebase pending.** Both `phase/4` heads have moved since review (BE R29b-3U and EMAIL-UNIQ-BE, App AL-REST-APP). The lead
rebases each branch once, on your ring, and re-stamps it. This is the last lane that needs a re-stamp after a rebase,
because it brings in the rule that ends them.
**Brief:** `docs/agents/gate-3a/brief.md` in each repo (D-45 item G7; D-55 split it into this first lane). Lead decisions:
D-52. **Tier 2** (gate scripts): two Opus seats (D-43). **Shared code** (gate scripts), so the old Mac gates and merges
it (D-61).

## What it does
`risk-check.sh --reviews` accepts a review file whose `Reviewed:` SHA is not an ancestor of HEAD only when all of these
hold:
1. Every reviewed commit is patch-identical (`git patch-id --stable`, `--binary`, `--root`, `--no-color`), one to one
   and in the same order. Merges are refused.
2. The lane files are byte-identical to the reviewed head (patch-id ignores whitespace).
3. The base only moved forward: old base is an ancestor of the new base, and the base is an ancestor of the head.
4. The base move touches no lane file. The comparison folds case.
5. Only plain `100644` review files follow the reviewed commits.
6. The carry path takes full 40-hex SHAs only and never ref names (`sha_of_text`, `GIT_NO_REPLACE_OBJECTS=1`). It fails
   closed (pipefail; refuses on a git error, an empty patch-id or an empty list).

On success the gate prints `REVIEW CARRIED OVER: <file> (<n> commits patch-identical, base <old8>→<new8>)` before
`REVIEWS OK`. Refusals print `REVIEWS REFUSED: REVIEW NOT CARRIED: <file>: <reason>`. Both repos use the same code,
messages and 15 test names.

## Reviews
- Round 1: BE got FIX (seat 1, parity) and ACCEPT (seat 2). App got FIX from both seats; seat 2 found a **real
  bypass**: a fetched tag named like the short SHA could point at a forged, patch-identical chain.
- Fix round 1 (D-52) closed the bypass and the parity gaps and added fail-closed behaviour.
- Both seats ACCEPT on both repos. Seat 2 retried the bypass variants (tag, branch, 40-hex ref, abbreviated SHA,
  replace ref, SHA missing locally) in a throwaway repo, and every one refuses or resolves to the real commit.

## Tests (builder, from that run's own output)
- BE `risk-check-test.sh`: **125/125** on `7e7a3ff8`.
- App `risk-check-test.sh`: **117/117** on `e4d1aba7`.
- Each new case fails on the round-1 head. Checks that already existed were proven by mutant.
- No Gradle.

## For the old Mac
1. On your ring, I rebase each branch, re-stamp, and ring back.
2. `verify.sh` in each repo (light gate, scripts only) with the two review files.
3. Merge. After the merge, the lead pastes the WORKFLOW line: "no re-stamp on a clean rebase; the gate checks it
   (GATE-3a)". From then on, a clean rebase keeps its stamps.

## Docs
`docs/operations/verify.md` "Reviews after a rebase" in both repos lists the five conditions and the messages. User
guide: none.

## Follow-up rows (GATE-3 remainder)
- Port BE's `same_at` reviewed-head hit check and its self-test to the App. This is a LOW gap on the ancestor path,
  from before this lane.
- 7-hex SHAs are still accepted on the ancestor path (from before this lane).
- BE: add the App's newline-path and case-variant base-move tests.
- The hook should re-run `--reviews` with the remote copy in the App (GATE-3 G2).
- `$range` is resolved twice; this fails closed and predates the lane.
- Rule 3 is path-only: a semantic merge break can pass. That is by design, because the builder and the gate still run
  the tests (see R29b-3U today).

## Timeline (new Mac; L37 style A)
- Brief at 17:10, lane-ready at 18:35: about 1 h 25 m of wall time.
- **Build:** BE 20 m, App 25 m, in parallel.
- **Rework:** fix round 1, BE about 30 m and App about 60 m (the App also ran full self-tests against its base).
- **Review:** round 1, seat 1 7 m and seat 2 9 m (both repos each); fix checks 3 m + 3 m.
- **Test:** inside the build (scripts only).
- **Waiting:** about 10 m.
- **Size:** BE 13 commits, App 15 commits (scripts, self-tests, verify.md, reports). 1 fix round. First-pass gate: not
  run yet.
- **Cost:** builders about 185 k (BE) and 215 k (App); seat 1 about 180 k; seat 2 about 200 k.
- **Brief lines (D-67):** none from the builders. Seat 1 noted the App `same_at` gap (now a row).
