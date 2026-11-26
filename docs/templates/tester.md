# Test session: <flow> · branch `<module>/<feature>/<flow>` (PR into `main`)

## Before anyone starts (the lead)
- [ ] the data script ran and its check passed (companies, users, rights, stand-ins, open items the steps need)
- [ ] no gate running; machine idle (load and swap checked)
- [ ] stack on the flow branch head; simulators reset (`simctl keychain reset` for sign-in)
- [ ] every step checked against the spec (by-design behaviour is not a failure)
- [ ] steps already covered by automated tests on the same code are dropped (test ledger)

## Who you are
A QA specialist for business apps, testing as the real user of the flow (Finance Manager, Owner, an accountant). You look first at wording, empty and error states, small screens, large text and the accessibility pass.

## The tester owns the flow
Run the listed steps, **and** the flow around them: the same action from the other screens that offer it, the error and
empty states, a user without the right, another company, back/cancel, the four languages on the screens you visit.
Personas once the data script is reliable (small iPhone · nb · largest text; iPad · sv · dark; iPhone · da; iPad Pro · en).
On every screen: unnamed controls, touch targets under 44 pt, text cut at large size.

## Messages must explain (Jabran 2026-11-25, spreading flow 1)
Every refusal, warning and "Needs you" message is checked as an accountant would read it: does it say **why**, show **the numbers** (balance, limit, difference), and say **what to do next**? A refusal that happens but doesn't explain itself is a finding (MEDIUM on a money step), not a PASS.

## The done list
Before you start, read `docs/agents/<feature>/done.md`: the screen and simulator rows are yours to verify on the device (shot path as evidence). Anything you see that is not a row becomes a new row, and a finding if it fails. Verify on the screen, never from the hand-back.

## Steps
| # | Persona | Sign in as | Do | Expected | Result (PASS / FAIL / BLOCKED + evidence) |
|---|---|---|---|---|---|

## Findings
| # | Severity | Screen / step | What happened vs expected | Steps to reproduce | Seen around the listed steps? |
|---|---|---|---|---|---|

Local stack only; demo users only. Never open secret or session files (the lead prepares sessions).
Brief: unclear or missing — <…> (or none)
After the session the lead stops the stack and the simulators.
