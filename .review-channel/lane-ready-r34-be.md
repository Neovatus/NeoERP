# Lane ready: R34-BE (BackEnd gate hardening) — 2026-11-21

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-r34-be` (pushed, head `4b924f08`). Merge target: `phase/4` (at `6f5481a3`, which holds ISO-R1).
**Brief:** `docs/agents/r34/brief.md` (fix-list R34: port the App Lane 0 gate fixes, plus R30 c–e). Approved: Jabran 2026-11-21 ("right after App Lane 0 merges").
**Builder:** Opus 5.5 high. **Reviewers:** Opus 5.5 (fresh) and Fable 5.2 security review (independent) for rounds 1–3; small round-3 fix and the rebase confirmed by Opus and Sonnet (budget rule).

## Reviews (`docs/agents/r34/` on the branch)
- Round 1: Opus FIX (2 MEDIUM: ratchet cap raised 60 → 61 against R29's "only shrinks"; Groovy `*.gradle` NORMAL) and Fable FIX (**3 HIGH proven in a scratch clone**: the pushed tree classified itself — the hook ran the branch's own `risk-check.sh`; Unicode alias paths `ſ` / Kelvin `K` landed in real risk folders on APFS and read NORMAL; Groovy Gradle files; plus service `application*` not risk). All fixed with regression tests (10 old FAIL / 56 new PASS).
- Round 2: Fable FIX (2 new HIGH proven: verify advised installing the dispatcher from the pushed tree; `pre-push:77` still ran the checkout's copy) + 1 MEDIUM; fixed (7 old FAIL / 61 PASS). Opus round 2 then flagged the bootstrap issue.
- Round 3: Fable and Opus both found the bootstrap MEDIUM (a pre-R34 base could never get a marker; the old installer reset `core.hooksPath`); fixed with a one-time bootstrap and no installer runs (3 old FAIL / 64 PASS). Opus and Sonnet ACCEPT.
- Rebase onto `6f5481a3` (two `docs/risk-paths.txt` conflicts, resolved as the union of both lanes' globs): Opus and Sonnet ACCEPT (`review-1d-opus-rebase.md`, `review-2e-sonnet-rebase.md`, the final pair: 30 of 32 commits identical, all ISO-R1 globs kept, 64/64 gate cases, 63/63 architecture tests).

## Full run (`scripts/verify.sh` on `4b924f08`, 2402 s)
**`verify: OK`**, marker written: **4297 tests, 0 failed, 59 skipped** (16 modules; skips unchanged). Money invariants OK (9 companies, 25 posted journals, 73 lines). **Bootstrap** used as designed: the base `6f5481a3` has the pre-R34 gate, so the head's `risk-check.sh` judged the range (RISK, two reviews: REVIEWS OK), and the hook on the remote judges the push.

## What it holds
- Hook and verify use only the **push base's** gate scripts; a base without the gate is refused; delete/recreate of `phase/N` and direct `main` pushes refused; no installer ever runs from a branch; absolute hooks path.
- For a RISK push the marker base must equal the push base, and every RISK file must be in each review's own diff; a review may vouch only for a file unchanged between its base and the push base (`--literal-pathspecs`); strict review parsing; hook re-hashes review files.
- Risk paths: `gradlew`, `gradle/**`, `*.gradle(.kts)`, `buildSrc/**`, any non-ASCII path, SQL / migration folders / main resources / `application*` anywhere under services and shared, the floor classes; ISO-R1's role and binder paths kept.
- verify: test floor `min_tests=4200` + 24 required classes, no build cache, Gradle heaps on the command line, external inputs in the marker, self-tests that fail on broken gates.
- Tenant ratchet: cap back to 60; the one new store in its own frozen set with cap 1.
- **Threat model** in `docs/operations/verify.md`: the gate stops accidents and careless pushes; bypasses needing a deliberate local actor (`--no-verify`, editing `.git/config` or hooks, rewriting the trusted base) are accepted limits until GitHub branch protection or CI at go-live.

## Write-scope check
`scripts/**`, `.githooks/**`, `docs/risk-paths.txt`, `docs/operations/verify.md`, `AGENTS.md` "Before push", `architecture-tests/**`, `docs/agents/r34/**`. No product code. No AI attribution (checked).

## Docs pages
Developer: `docs/operations/verify.md`, `AGENTS.md` "Before push". User guide: none.

## Follow-ups
- Not fixed (reasons in `fix-list-round1.md`): 8 more ratchet name endings (would freeze more lines); verify's own risk line stays local (the hook decides).
- LOW (Opus round 3): an explicit old `--range` still bootstraps after the gate lands; the hook ignores such markers.
- Add a branch-protection row to `hosting-and-go-live-requirements.md` (next BE docs change).
- R34-App: Android compile in verify, the same hardening (trusted base scripts, non-ASCII paths, absolute hooks path), App LOWs.

## After MERGE
Fast-forward BE `phase/4` to `4b924f08` through the hook; then run the new `scripts/install-hooks.sh` once in the BE clone (sets the absolute hooks path; your checkout included), as approved for the hook earlier; the old Mac does the same after pulling.

## For Jabran
Verdict (lead's call: MERGE).
