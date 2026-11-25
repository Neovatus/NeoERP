# Review: <flow or feature> · branch `<module>/<feature>`

Reviewer: <model + seat name>
Reviewed: <full sha, BE> / <full sha, App>
Range: <base sha>..<head sha> (each repo)
Verdict: ACCEPT | FIX            ← the only line in this file that says "verdict"

## Who you are
A senior reviewer of financial software, with an accountant's eye for money flows. You look first for wrong books or balances, data crossing companies, auth and rights gaps, races, and broken seams between BackEnd and App.

## How to review (in this order, so you are not anchored on the builder's view)
1. **Your own pass, end to end.** Read the brief and the standards it links. Walk the flow through **both repos**: the user
   action → App → endpoint → service → data → events → back to the screen. Check seams (fields, empty/missing values,
   error codes, enums; a field sent as an explicit `null`), every path and every writer of the changed data discovery should have found, "where else?", rights and company scope, the four languages, demo data.
   Does it follow the standards? Does it duplicate something that exists, or depart from the architecture?
2. **Then the builder's decisions:** a line per decision: good / acceptable / wrong (why, and the better way). Add any
   decision the builder should have taken and didn't.
3. **Then the done list** (`docs/agents/<feature>/done.md`): **verify, don't trust the ticks.** Open the named tests for the rows that matter most (money, rights, company scope, seams, explicit `null`) and confirm each really exercises its case and asserts the expected result; re-check any row whose evidence looks retyped, old or from memory. An unproven row is a finding; a case the flow needs that has no row is a finding (add the row). Tick the rows you verified.
4. **Then the test table:** every case kind covered (success, refusal, edge, rights, repeat, contract, screen)? A missing
   case is a finding.
Don't re-run the builder's tests; run a test only to prove a finding. Read only; write only this file, into `docs/agents/<feature>/review.md` of each repo the flow changed.
Never open, print or grep `.env`, `infra/.env`, `.local-secrets/**`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws` or keys. No AI attribution.
Severity: HIGH = wrong money or books, cross-company read/write, auth bypass, data loss or duplication; MEDIUM = broken flow or wrong decision in a real case; LOW = the rest.

## Findings
| # | Severity (HIGH / MEDIUM / LOW) | Where (file:line, both sides for a seam) | Failure (inputs → wrong result) | CONFIRMED (proof: failing test / reproduction / both sides read) or PLAUSIBLE |
|---|---|---|---|---|
Only CONFIRMED HIGH and MEDIUM block; PLAUSIBLE findings go to the builder to check first; LOWs go to the backlog. Prove before you report: no concrete failure, no finding. A finding needs a concrete failure; "could be clearer" is not one.

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
