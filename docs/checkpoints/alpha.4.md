# Alpha.4 — Ironbreak

Owner excluded Journey to the West on 2026-10-01. Four integrated games: Coastal Escape, Vault 7, Nightfall and Ironbreak. Next: Chrono Circuit, Olivia and Math Civ.

Ironbreak source: MathQuest `285c2119d825eeea784e84248c9c509668b16269`. [Specification](../change-specs/v0.1.0-alpha.4.md). Implementation checkpoint `6167e63` precedes extended tests. Preserves original factory, robots, boss, three lives, checkpoints, equipment, pixel rendering and synthesized score. Server owns simulation, 300 active seconds, retry and guided choices. One gate per new round; retries within remaining lives preserve credit. Teacher controls, exact saved state and fresh replay admission apply.

Verification: build hashes for all 87 imports; existing 28 tests plus four Ironbreak lifecycle tests pass. Ironbreak Chromium touch-enabled 1180×820 browser check passes admission/gear, simultaneous movement/jump in both release orders, cancellation, blur, native menu, teacher pause, rotation, viewport, refresh, guided completion and replay gate, without page errors. Action screenshot inspected. Existing shared input is reused unchanged. Physical iOS, school network/concurrency and deployment remain Not run.
