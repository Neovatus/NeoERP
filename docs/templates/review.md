# Review: <batch name> · <module>/phase-<x>

Reviewer: <model + seat name>
Reviewed: <full sha, BE> / <full sha, App>
Range: <base sha>..<head sha> (each repo)
Verdict: ACCEPT | FIX            ← the only line in this file that says "verdict"

## How to review (in this order, so you are not anchored on the builder's view)
1. **Your own pass, end to end.** Read the brief and the standards it links. Walk the flow through **both repos**: the user
   action → App → endpoint → service → data → events → back to the screen. Check seams (fields, empty/missing values,
   error codes, enums), every path discovery should have found, rights and company scope, the four languages, demo data.
   Does it follow the standards? Does it duplicate something that exists, or depart from the architecture?
2. **Then the builder's decisions:** a line per decision: good / acceptable / wrong (why, and the better way). Add any
   decision the builder should have taken and didn't.
3. **Then the test table:** every case kind covered (success, refusal, edge, rights, repeat, contract, screen)? A missing
   case is a finding.
Don't re-run the builder's tests; run a test only to prove a finding. Read only; write only this file.

## Findings
| # | Severity (HIGH / MEDIUM / LOW) | Where (file:line, both sides for a seam) | Failure (inputs → wrong result) | Confidence (confirmed / plausible) |
|---|---|---|---|---|
HIGH and MEDIUM block; LOWs go to the backlog. A finding needs a concrete failure; "could be clearer" is not one.

## Builder decisions
| Decision | Judgement | Why |
|---|---|---|

## Checklist (the builder fills it first; you check it)
- [ ] flow works on every discovered path · [ ] contract: both sides read, examples match, missing/empty fields handled
- [ ] rights and company scope · [ ] money invariants unaffected (or tested) · [ ] no duplicate piece, architecture kept
- [ ] feature checklist done (flag, permissions, demo data, languages, docs pages) · [ ] test table complete

## Read and found clean
<what you read without findings, so coverage is visible>

Brief: unclear or missing — <…> (or none)
