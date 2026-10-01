# Math Arcade alpha.2 verification — 2026-10-01

Scope: add Vault 7 to the existing classroom + Coastal Escape pilot. Baseline is GitHub `d3040d129ac54c0d4371d4313de5ddcec74f5b55` (its verification record remains in that commit). Vault source is MathQuest `59c11c90c2f0893333dfe30b62578fd73deb9bbf`. Pre-verification local implementation checkpoint: `82819be71a17762266e8d1620e94d415787b8208`. Local and connector commit identities differ; publication compares exact file blob hashes.

| Check | Result | Evidence |
| --- | --- | --- |
| Source integrity/build | Passed | `npm run build`; 58 vendored files match their Git blob hashes; unchanged Vault core/assets and reproducible presentation extraction |
| Syntax | Passed | `npm run check`; backend, round dispatch and both game hosts |
| Application/core tests | Passed | `npm test`; 22 tests, 0 failures on Node 24.19.0 |
| Original shared-input regressions | Passed | `NODE_PATH=/tmp/arcade-browser-tools/node_modules node --test test/shared-input.mjs`; 10 tests, 0 failures; happy-dom 20.14.5 |
| Original Vault mechanics | Passed | Adapted upstream tests: both routes traversed with live hazards; base speed/jump/coyote/buffer, collision/light occlusion, sensor crossing, three detections, held extraction and 180-second expiry |
| Gate/round authority | Passed | Entry gate required; immutable route/gear; duplicate launch; invalid loadout rollback; per-game availability; stale resume rejected; wrong round ID rejected |
| Recovery and teacher control | Passed | Exact position/objectives/elapsed/spent equipment survive SQLite reopen; resumed paused; teacher pause/end; disconnect lease; no extra math inside a round |
| Endings/replay | Passed | Extraction, capture and timeout each require fresh gate. Server-lifecycle terminal tests position fixtures near each boundary; full route traversals are separate upstream-core tests |
| Accessible path | Passed | Original scenes, wrong-answer integrity, duplicate/stale scene commands, Toolkit bypass, one-use Cloak, checkpoint credit, final 0.6-second hold and release reset, distinct accessible outcome |
| Vault browser workflow | Passed | `CHROMIUM_PATH=/tmp/chromium node test/vault-browser.cjs`; Chromium 138 test binary, Playwright; teacher 1440×1000 and student touch-enabled 1180×820; no page errors |
| Browser workflow details | Passed | Teacher availability, student joining/admission, entry gate, route/gear setup, action, teacher pause/resume, refresh to same paused round, accessible completion and replay gate |
| Synthetic held controls | Passed | Actual Chromium touch events: simultaneous direction/jump, both release orders, cancellation, blur and fresh input. Original DOM suite additionally covers capture failure/loss, drag outside, missed pointer release/touch-list cleanup, stationary holds, keyboard aliases, blocked contacts and teardown |
| Synthetic native-menu interference | Passed | HUD contextmenu canceled and play paused. Shared suite checks selection/drag prevention while ordinary editable fields remain usable |
| Synthetic viewport/visuals | Passed | Portrait rotation pauses; return to landscape preserves zero scroll and width. Canvas stays above objective/controls. Action and accessible screenshots inspected after layout correction |
| Coastal Escape regression | Passed | `CHROMIUM_PATH=/tmp/chromium node test/browser.cjs`; original teacher/student/gate/play/pause/reload/replay/preview flow; no page errors |
| Physical iPad/iPhone held-input checks | Not run | Emulation does not establish actual device release/cancel/background/lock behavior |
| Physical iPad/iPhone native-menu checks | Not run | Requires real Safari/Edge long presses on controls, HUD and battlefield |
| Physical iPad/iPhone viewport/audio checks | Not run | Actual browser bars, keyboard, zoom, safe areas and audible playback require hardware review |
| School Wi-Fi and classroom concurrency | Not run | No claim based on local testing |
| Hosted version/assets/persistent hosting restart | Not run | Source checkpoint only; no Render deployment |
| Other six games | Pending | Disabled in catalog; Nightfall is next. Chrono/Olivia native gates and Math Civ no-added-gate exemption remain specified |

The two-finger browser test initially sent a release for the opposite contact; native touch logs identified the test error. Correcting the test made both release orders pass without changing the shared input module. Visual inspection found a canvas/objective overlap; the corrected fixed gameplay layout was retested and inspected. Gate-completion toasts now clear before gameplay, and pending configuration changes do not reset post-gate loadout choices.

The standard Playwright browser download failed in this execution environment. Browser checks used a Chromium 138 binary from the pinned development-only `@sparticuz/chromium@138.0.2` package. These temporary verification tools are not deployed application dependencies.

This is a locally tested integration checkpoint, not a verified-device release. See [scope and limitations](alpha.2.md) and [running instructions](../RUNNING.md). No handbook changes were made.
