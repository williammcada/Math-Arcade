# Current Worker verification — v0.3.0-rc.1

See [exact verified Worker checkpoint](checkpoints/v0.3.0.md): source `900198428f94be221e61e76eb330d87f09ebe908`, successful run `37734366972`. Full build, 41 Node tests, seven Chromium suites and real workerd end-to-end/persistence checks passed. Live deployment and physical iPad/school-network checks remain Not run. Earlier sections below are historical.

# v0.2.0 verification — 2026-10-08

- Node 24 build verifies 265 canonical source blob hashes.
- 39 server/engine tests pass, including concurrent HTTP redemption (one success, one rejection), 45-second expiry, manual rotation, consumed-code restart persistence, teacher authorization, existing device continuity and class/individual assignments.
- All six Chromium/Playwright browser suites pass: classroom/Coastal, Vault 7, Nightfall, Ironbreak, Chrono and Olivia. Dashboard QR/password admission, gameplay recovery and native campaign boot are covered. Physical iPads are not covered.
- Canonical Math Engine provides 312 skills and diagram/keypad presentation. Math Quest sources are current at cd35fd912fbde2007f8fade6b93b1c2a1421275c; other exact source commits are in vendor/manifest.json.
- Hourly GitHub workflow refreshes upstream files, checks build/server/browser suites, and commits only passing candidates. Its first hosted Actions execution is pending.
- Math Civ remains unintegrated. Journey is excluded. No live backend deployment or school-network test has been performed.

Earlier checkpoint records follow.

# Math Arcade alpha.3 verification — 2026-10-01

Scope: Nightfall city integration into the two-game classroom pilot. GitHub baseline `c947c1c9254bde26ad73037319a3c1f4a51ebf0c`; MathQuest `59c11c90c2f0893333dfe30b62578fd73deb9bbf`. Local implementation checkpoint `83ea0a4`; connector publication compares exact source-tree hashes. [Prior verification](checkpoints/alpha.2-verification.md).

| Check | Result | Evidence |
| --- | --- | --- |
| Source integrity/build | Passed | `npm run build`; 80 unchanged upstream blobs match their Git hashes; generated URL normalization only |
| Syntax | Passed | `npm run check`; backend, dispatch, three game hosts |
| Application/core tests | Passed | `npm test`; 28 tests, 0 failures; Node 24.19.0 |
| Shared held-input suite | Passed | 10 upstream regressions; happy-dom 20.14.5, failed/lost capture, global release, native touch-list cleanup, both multi-touch release orders, outside/blocked contacts, stationary holds, keyboard aliases and teardown |
| Nightfall round authority | Passed | Gate admission, invalid equipment rollback, immutable loadout/threat, availability, stale resume, wrong round ID, rejected client snapshots, native 7,200-second envelope, no 300-second expiry |
| Recovery/teacher control | Passed | Exact enemy phases/targets, bullets, doors, windows, objectives, supplies, alarm and clock persist across SQLite restart; paused recovery; class pause/end and disconnect lease |
| Native encounters | Passed | Source simulation fixtures across all five threats: Carbine/Pouch/Vest, alarms do not restart, windows, shotgun switching/ammo, six objectives, single eight-enemy garage horde. Focused native held interaction at the fuse. These are fixture checks, not a full physical city traversal |
| Replay | Passed | Loss, victory, review expiry and abandonment consume the round; fresh math required; no mid-round gates |
| Accessible mission | Passed | Same round/resources, hazard clock frozen, covered/risky approaches, duplicate/stale commands, optional store diversion/window/shotgun/rescue, distinct assisted success |
| Nightfall browser flow | Passed | `CHROMIUM_PATH=/tmp/chromium node test/nightfall-browser.cjs`; Playwright/Chromium 138, teacher 1440×1000, touch-enabled student 1180×820; no page errors |
| Synthetic input/interruption | Passed | Actual Chromium two-contact movement/fire release in both orders, cancellation, keyboard release, map, blur, native-menu prevention, teacher pause, portrait rotation, refresh to same paused round |
| Visual/viewport | Passed | Action and accessible screenshots inspected; canvas above objective/controls, zero page scroll, landscape width retained |
| Vault/Coastal regression | Passed | Existing `test/vault-browser.cjs` and `test/browser.cjs` classroom/game flows rerun; no page errors |
| Physical iPad/iPhone Safari | Not run | Actual release/cancel/lock/background, long press, viewport, audio and demanding combined encounters require hardware |
| School Wi-Fi/classroom concurrency | Not run | Local tests do not establish hosting capacity or network behavior |
| Hosted assets/persistent restart | Not run | No Render service provisioned or deployment |
| Five other games | Pending | Disabled; Journey recovery source identified; multiplayer bridge next; Chrono/Olivia native gates, Math Civ no added gates remain specified |

The initial import check caught an empty alarm file; it was fetched again and now matches the pinned source hash. An initial shotgun test assumed pickup selected the primary weapon; source pickup selects the shotgun, so the test was corrected to exercise switching both ways. No source gameplay change was needed.

Temporary Playwright, happy-dom and Chromium tools are not deployed dependencies. This is a locally tested integration checkpoint, not a verified-device release. No handbook changes.
