# Brief: `core/mock-backend` flow 1 `data-source` · App · review: one Opus 5.5 high

Feature `core/mock-backend` (split, App): flow 1 **`data-source`** (this) → later flows move the remaining features over, one area per flow. Branches: feature `core/mock-backend/feature` (from `main`), this flow `core/mock-backend/data-source`. Use `docs/templates/brief.md` for everything not said here. Term: **mock** (never "fake").

## Goal
UI tests exercise the App's **real** data layer: a **mock data source** at the lowest layer (in place of the real HTTP call) serves **JSON files** per endpoint and scenario, so the real repositories, mappers, strict JSON decoding, error handling, ViewModels and screens are tested end to end. Today tests mock whole repositories (`data/mock/Mock…RepositoryImpl`, ~120 test references; no HTTP-level mock; 2 JSON fixtures), which is why the Phase 4 `null` bugs passed every test.

## Decided rules (Jabran 2026-11-25; ADR-027 §5)
- The mock sits at the **data-source / network boundary** (the `NeoErpNetworkRuntime` transport or the repository's remote data source: discover which is the single seam), not at the repository.
- **JSON per endpoint and scenario**, with status code: success, empty list, explicit `null` fields, missing optional fields, unknown enum value, 400/403/404/409/422/503 with the stable error codes. A test picks the scenario it needs.
- **Success JSON comes from the BackEnd's contract examples** (ADR-027 §5: the BE copy is the source; the App keeps a copy with the BE version it came from; the gate check that the copies match is a later gate decision for Jabran, so only record the version now).
- **Strict:** the mock refuses requests the real API would refuse (wrong company id, a missing required field, an unknown path) with the API's own error shape, so a test can't pass on a request the server would reject.
- **Definition of Done rule (new, for all later App work):** new UI tests use the JSON mock data source, not a repository mock. Existing repository mocks are removed per area as it moves over.
- The same JSON can feed the size tests and the accessibility checks later (not in this flow).

## Scope edges
- **In:** the mock data source + JSON loading (`commonTest`/`jvmTest` helpers), the fixture layout `jvmTest/resources/fixtures/<area>/<endpoint>/<scenario>.json` (or the ADR-027 path), the strict request checks, and moving **two areas** over as the proof: Accounts **approval limits** (the Phase 4 `null` bugs) and **journals** (list + detail + editor). Docs: a developer page "How to write a UI test with the mock data source" and the Definition-of-Done line in `docs/templates/brief.md` (workspace; tell the flow lead, who tells the module lead).
- **Out:** other areas (later flows), the gate fixture-copy check, demo/preview mode, BackEnd changes (read the BE examples; never write there).

## Definition of Done (plus v2 §5)
- Failing-first proof that the new set-up catches what the old one missed: e.g. a `null` `featureEnabled` in the approval-limits JSON fails the screen on the pre-fix decoder and passes on today's.
- Each scenario kind above has at least one test in the two moved areas; the strict checks each have a refusal test.
- The two areas no longer use their repository mocks in tests; no test lost (count the moved tests).
- Builders run only their own tests + compile; never edit gate scripts; no gate or whole suite.
