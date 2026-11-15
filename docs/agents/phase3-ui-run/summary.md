# Phase 3 UI run summary

- T11: blocked — 0 findings (not run)
- T12: blocked — 0 findings (not run)
- T13: blocked — 0 findings (not run)
- T14: blocked — 0 findings (not run)
- T15: blocked — 0 findings (not run)
- T16: blocked — 0 findings (not run)
- T17: blocked — 0 findings (not run)
- T18: blocked — 0 findings (not run)
- T19: blocked — 0 findings (not run)
- T20: blocked — 0 findings (not run)
- T21: blocked — 0 findings (not run)
- T22: blocked — 0 findings (not run)
- T23: blocked — 0 findings (not run)
- T24: blocked — 0 findings (not run)

Blocker: Desktop control listed the running MainKt process but could not attach to it by name or listed identifier. No test steps were performed, and feature restoration was not verified.

Retry: Desktop control was reset and again listed MainKt as running, but attaching by its listed identifier returned “Invalid app: com.oracle.java.java”. No test steps were performed on retry.

Launch retry: `./gradlew :composeApp:run` displayed “NeoERP is already open.” Desktop control listed two running entries named `MainKt`, with identifiers `com.jetbrains.jbr.java` and `com.oracle.java.java`; it did not provide window titles or a window list. Attaching to the first identifier returned “Invalid app: com.jetbrains.jbr.java”; attaching by name returned “Invalid app: MainKt”. The sign-in screen was not observed and no test steps were performed.
