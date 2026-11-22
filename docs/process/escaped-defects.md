# Escaped defects (DECISION 2026-11-22, both leads)

A defect found in code from a lane that was already merged, with that lane's name. It shows what reviews and gates
missed, which feeds the slicing comparison (L37) and the gate changes. One row per defect, newest first. Fill in the
"Found by" lane and the review round that caught it. "Fixed in" stays open until the fix lane merges.

| Found | Defect (short) | Origin lane (merged) | Found by (lane, reviewer/round) | Severity | Fixed in |
|---|---|---|---|---|---|
| 2026-11-22 | The server does not refuse a second receivables opening-items entry. A duplicate (same customer and original number) and `FILE_ALREADY_IMPORTED` are only warnings that one tick acknowledges, and `FILE_ALREADY_IMPORTED` is skipped at the confirm re-check (`OpeningItemImportService.kt:275`). On the payables side only submitted or posted bills are refused. So receivables can be doubled. | CP-B.OI1 opening items import (BE `34ae5f25`, 2026-10-31) | FIX-APP-B2b, Opus review 1 (H1); Fable D-33 check | HIGH (money), pending Jabran's rule N10 (refuse or warn; OI C-20) | open: BackEnd row with a go-live gate (D-33, D-35) |
| 2026-11-22 | `OrgIamAccessClient.hasPermission` treated any user-service failure as 403 (fails closed, but not the 503 that D-25 asks for); `accessibleOrgIds` turned any failure into an empty set (unused). | R29 / earlier org security code (before R29b-1) | R29b-1, Fable review 1 (L1) and Opus fix check | LOW | R29b-2 (fix round 1, pending merge) |
| 2026-11-22 | The App `verify.sh` took the BackEnd lock (a leftover), so App and BackEnd gates waited on each other. | TEST-SPEED-APP / earlier App gate lanes | GATE-2 brief item 1 (old-Mac lead) | LOW (time, not correctness) | GATE-2 (merged 2026-11-22) |
| 2026-11-22 | The App gate is older than the BackEnd's in three rules: a non-ASCII or control-character path is not RISK, the hook does not re-run `--reviews` with the remote's `risk-check.sh`, and the review-file checks are looser. | Lane 0 App gate / TEST-SPEED-APP | GATE-2, Fable review 2 (App finding 8) | LOW (gate) | open: GATE-3 (JABRAN-TODO N9) |
