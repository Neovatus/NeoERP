# New-Mac timing notes (working notes for MEASURE-1 Timeline blocks) — 2026-11-22

Raw numbers from the sub-agent task notifications on the new Mac. `duration` and `tokens` are **cumulative per agent**
(a resumed agent reports its running total). Times are wall-clock agent time, not waiting time. These notes feed the
`## Timeline` blocks and the back-fill in `docs/process/phase4-lane-timing-newmac.md`; delete the file once that exists.

| Lane | Agent (model) | Step | Cumulative duration | Cumulative tokens |
|---|---|---|---|---|
| FIX-APP-B2a | builder (Opus high) | build, rows + report | 1 h 30 m | 705 k |
| FIX-APP-B2a | builder | + R21 (D-27) | — | 789 k (after fix round 1: 14 m more) |
| FIX-APP-B2a | builder | + fix round 2 | + 5.5 m | 789 k |
| FIX-APP-B2a | review 1 (Opus high, re-run) | review | 9.5 m | 259 k |
| FIX-APP-B2a | review 2 (Sonnet high) | review | 4.6 m | 209 k |
| FIX-APP-B2a | Opus | fix check + final file | 3.7 m total | 315 k |
| FIX-APP-B2a | Sonnet | fix checks 1, 2 + final file | ~1.1 m + 0.5 m | 255 k |
| R29b-1 | builder (Opus high) | fix round 1 | 45.8 m | 359 k |
| R29b-1 | builder | fix round 2 | 6.4 m | 395 k |
| R29b-1 | Opus | fix check (re-run) | 3.5 m | 155 k |
| R29b-1 | Opus | final file | 0.7 m | 174 k |
| R29b-1 | Fable high | fix check 1 | 8.7 m | 271 k |
| R29b-1 | Fable | fix check 2 + final | 1.2 m + 2.2 m | 293 k |
| GATE-2 App | builder (Opus high) | build | 30 m | 265 k |
| GATE-2 App | builder | alignment (D-31) | 21 m | 355 k |
| GATE-2 App | builder | fix round 1 (D-32) | 16.5 m | 399 k |
| GATE-2 BE | builder (Opus high) | build | 31.5 m | 282 k |
| GATE-2 BE | builder | fix round 1 + alignment | 20 m + ~2 m | 346 k |
| GATE-2 both | review 1 (Opus high, self-tests) | review | 14.3 m | 226 k |
| GATE-2 both | review 2 (Fable high) | review | 17.1 m | 321 k |
| R29b-2 | builder (Opus high) | build | 3 h 19 m | 888 k |

Earlier rounds (R29b-1 build and round-1 reviews, B2a's first build hand-off times, BE-JDK21) are only in the session
transcripts: the back-fill reader takes them from there.
