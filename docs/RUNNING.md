# Production hosting update — v0.3.0-rc.1

Cloudflare Workers and Durable Objects are the approved hosting direction. Follow [CLOUDFLARE.md](CLOUDFLARE.md); Render/Node deployment material below is historical. Node instructions remain useful for local/reference testing.

# Run the Math Arcade pilot

Requires Node 24. Build with `npm run build`. Set `ARCADE_TEACHER_PASSWORD` to a private password of at least 12 characters, then run `npm start`. Default address is http://localhost:3000; teacher desk is /?role=teacher. For a network pilot use the host's reachable HTTPS URL, not localhost, on the iPads. Secure browser APIs and production cookies require HTTPS.

Create a class and roster, edit class practice, open the arcade and display its QR/code. Students enter the current four-letter password and claim their names. Each password admits one device and expires after 45 seconds. Click New password for the next student without waiting; use Admit on the teacher dashboard. A replacement admission disconnects that student's earlier device. Individual Math practice buttons edit overrides. Assign to everyone replaces overrides explicitly.

## Render deployment preparation

The included Dockerfile builds the exact source. Configure a single Docker web service from the canonical GitHub repository. Set:

- `ARCADE_TEACHER_PASSWORD`: your private teacher password; use the host's secret environment settings.
- `PUBLIC_ORIGIN`: the exact HTTPS service origin, with no trailing slash.
- `ARCADE_DB_PATH`: `/data/arcade.sqlite`.
- `PORT`: host-provided port, or 3000.

Mount a persistent disk at `/data`. Do not use an ephemeral filesystem for student records. Persistent-disk hosting may require a paid service: check the selected Render plan and cost before provisioning. No hosting service was provisioned by this implementation. Health check: `/health`.

Keep one instance while SQLite is the persistence layer. Back up the database volume and use the teacher's record export before destructive changes. File deletion is permanent; no restore UI is included yet. Export excludes authentication tokens.

Verify the actual hosted version, teacher login, QR URL, two independent student sessions, different math assignments, replay gate, refresh recovery, teacher pause/end and persistent restart before classroom use. Then test physical iPads and the real school network. Do not infer these outcomes from a local desktop browser test.

## Repeat local verification

Run `npm run build`, `npm run check` and `npm test` on Node 24. Browser checks require Playwright available to Node and its Chromium browser: run `node test/browser.cjs`; optionally set `CHROMIUM_PATH` to an installed compatible Chromium binary. Playwright is a development verification tool, not an application runtime dependency. The browser test uses a temporary database and an explicit test password, never real classroom records.

## Vault 7 (alpha.2)

Enable Vault 7 on the teacher desk. After the assigned gate, choose Security corridor or Ventilation shaft and optionally Toolkit/Cloak. Start, then Resume extraction. A/D or arrows move; Space jumps; hold E at the security panel, access card and elevator. Q jams security with the Toolkit; R uses the once-per-round Cloak. Touch buttons provide the same actions. Controls & help, Reset controls, high contrast, reduced motion and music controls are available in the game.

Accessible extraction is an irreversible mode change within the same round, preserving integrity, checkpoints and spent equipment. Read the original decision scenes, choose a position and hold the final boarding control. There is no speed timer in this mode; teacher pause/end still controls access. Every completed, captured, expired or abandoned round needs a new math gate.

Vault browser verification: `node test/vault-browser.cjs` (same Playwright/CHROMIUM_PATH requirements). The additional original shared-input regressions run with `node --test test/shared-input.mjs` when the development-only happy-dom package (tested version 20.14.5) is available to Node (or via NODE_PATH). Neither Playwright nor happy-dom is needed by the deployed application.

## Nightfall (alpha.3)

Nightfall is enabled in new sessions; teachers can enable it in existing sessions. Complete one assigned gate, select the existing threat preset and zero to three resources, then start the city mission. No short countdown: the historic active review envelope is two hours. Death, bus escape or leaving requires a new gate. Accessible mission retains no speed timer; teacher pause/end still applies. Refresh resumes the exact same round paused, with spent ammunition and all encounters intact. The First Response campaign chapter is outside this mini-game adapter.

Run its additional browser check with `CHROMIUM_PATH=/path/to/chromium node test/nightfall-browser.cjs` after the build. Playwright and a browser are development-only verification tools, not runtime dependencies.

## Math Civ (v0.2.1 candidate)

Enable Math Civ in the teacher desk's game list (older saved sessions may not have it enabled). Its card says Built-in math and opens the original campaign without shared-practice gates. Calculations, three attempts, resource effects and campaign outcomes remain authored by Math Civ. The roster identifies Built-in math; these outcomes do not create shared-engine mastery events.

Use Save & back to arcade before leaving. Save slots are scoped to the admitted student, and a second tab invalidates the first tab's write lease. Teacher pause, closure, session end and connection loss block play; reopening requires Resume. In Save / Load, export wanted slots before Delete all Math Civ campaigns; cancellation preserves them. Teacher deletion of the student or class also removes these saves.

Additional browser verification: `node test/math-civ-browser.cjs`. Physical iPad, all campaign branches, school-network behavior and deployment remain separate checks.
