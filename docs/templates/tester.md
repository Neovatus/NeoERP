# Test session: <batch name> · <module>/phase-<x>

## Before anyone starts (the lead)
- [ ] the data script ran and its check passed (companies, users, rights, stand-ins, open items the steps need)
- [ ] no gate running; machine idle (load and swap checked)
- [ ] stack on the phase head; simulators reset (`simctl keychain reset` for sign-in)
- [ ] every step checked against the spec (by-design behaviour is not a failure)
- [ ] steps already covered by automated tests on the same code are dropped (test ledger)

## The tester owns the flow
Run the listed steps, **and** the flow around them: the same action from the other screens that offer it, the error and
empty states, a user without the right, another company, back/cancel, the four languages on the screens you visit.
Personas once the data script is reliable (small iPhone · nb · largest text; iPad · sv · dark; iPhone · da; iPad Pro · en).
On every screen: unnamed controls, touch targets under 44 pt, text cut at large size.

## Steps
| # | Persona | Sign in as | Do | Expected | Result (PASS / FAIL / BLOCKED + evidence) |
|---|---|---|---|---|---|

## Findings
| # | Severity | Screen / step | What happened vs expected | Steps to reproduce | Seen around the listed steps? |
|---|---|---|---|---|---|

Local stack only; demo users only. Never open secret or session files (the lead prepares sessions).
Brief: unclear or missing — <…> (or none)
After the session the lead stops the stack and the simulators.
