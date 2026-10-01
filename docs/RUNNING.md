# Run the Math Arcade pilot

Requires Node 24. Build with `npm run build`. Set `ARCADE_TEACHER_PASSWORD` to a private password of at least 12 characters, then run `npm start`. Default address is http://localhost:3000; teacher desk is /?role=teacher. For a network pilot use the host's reachable HTTPS URL, not localhost, on the iPads. Secure browser APIs and production cookies require HTTPS.

Create a class and roster, edit class practice, open the arcade and display its QR/code. Students claim their names; use Admit on the teacher dashboard. A replacement admission disconnects that student's earlier device. Individual Math practice buttons edit overrides. Assign to everyone replaces overrides explicitly.

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
