# Math Arcade alpha.1 verification — 2026-10-01

Scope: classroom foundation and one-game Coastal Escape pilot. This is local verification, not a release or deployment approval. The original design checkpoint is `215089cfb1804180f865a8451e8704197833ee2e`. A local implementation checkpoint was preserved before extended tests: `6a907328c08799f72e552e2dfcbd4a5fca63a648` (local Git identity; the connector publication has its own commit identity).

| Check | Result | Evidence |
| --- | --- | --- |
| Pinned source integrity/build | Passed | Node 24.19.0; `npm run build`; all 52 source-file Git blob hashes match the manifest |
| Syntax | Passed | `npm run check`; backend, model and both frontend modules |
| Automated model and HTTP checks | Passed | `npm test`; 7 tests, 0 failures |
| Assignment semantics | Passed | Separate defaults/overrides, replace-everyone, restore inheritance, invalid selection rejection, active gate snapshot preserved |
| Gate/admission integrity | Passed | No student-facing answer key; duplicate/stale answer handling; pre-gate launch rejected; single-use grant; role isolation; replacement-device revocation |
| Persistence and round lifecycle | Passed locally | SQLite reopen preserves round/tick, pauses on restart; fractional frame accounting; disconnect lease; teacher pause/end; replay after timer expiry and final-life defeat |
| Terminal condition coverage | Fixture-based | Tests place the original core immediately before timer expiry or last-life defeat; this does not claim a full five-minute gameplay balance run |
| Export/deletion | Passed | Export omits authentication tokens; deletion confirmation required; student deletion preserves unrelated learner |
| HTTP boundary | Passed | Authentication, same-origin mutation guard, Secure/HttpOnly/SameSite cookies under HTTPS origin; server files not publicly served |
| Browser classroom walkthrough | Passed | `CHROMIUM_PATH=/tmp/chromium node test/browser.cjs`; Chromium + Playwright; teacher 1440×1000, student 1180×820 with touch enabled; no page errors |
| Browser workflow details | Passed | Class/roster, QR rendered, admission, draft preserved through assignment update, math gate, artwork/game launch, keyboard release, teacher pause/resume, reload paused recovery, leave/replay gate, preview draft isolation |
| Synthetic held-touch release | Passed | Chromium touchStart/touchEnd on D-pad, server receives held left then released input |
| Synthetic native-menu/selection suppression | Passed | Cancellable contextmenu prevented; computed user-select none; this is not a physical Safari long-press result |
| Synthetic viewport drift | Passed | Game viewport remains 1180px wide with zero document scroll after touch interaction |
| Visual inspection | Passed | Teacher dashboard, math preview/settings and running Coastal Escape screenshots inspected locally |
| Physical iPad/iPhone controls, menus and viewport | Not run | Requires actual target hardware; record these three checks separately |
| School Wi-Fi, classroom concurrency and QR camera scan | Not run | Local browser flow does not establish these outcomes |
| Remaining seven game integrations | Pending | Disabled in catalog; Chrono/Olivia native gates and Math Civ no-added-gate policy remain specified, not claimed implemented |
| Hosted version and persistent hosting restart | Not run | No Render service provisioned or Math Arcade site deployed |

Fixes made during local verification: preserve a typed answer when the teacher changes future assignments; preserve fractional server simulation frames; handle queued resume actions; correct the pause button label; require explicit resume on browser reload; retain typed drafts through temporary screen changes; raise the shared-IP request ceiling to accommodate classroom polling. The latter is configuration preparation, not a concurrency performance claim.

Known boundaries and the unexposed upstream assisted-flight mode are described in [alpha.1 scope](checkpoints/alpha.1.md). Use [running instructions](RUNNING.md) for configuration. Never describe this pilot as all eight games complete or as verified on physical devices.
