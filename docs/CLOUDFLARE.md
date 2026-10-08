# Math Arcade — Cloudflare deployment

The approved backend is a new `math-arcade` Worker with an independent SQLite-backed `ArcadeWorkspace` Durable Object. No MathQuest Worker, rooms, binding or migration is modified. Static Assets and API share one HTTPS origin. The existing MathQuest GitHub Pages/Netlify relay is not reused; school-network equivalence has not been tested.

## Exact verified package

Use the successful **Verify Math Arcade candidate** run for the source SHA in the latest checkpoint. Download its `worker-candidate-<SHA>` artifact. It contains `math-arcade-0.3.0-rc.1.tar.gz`: the exact Worker bundle and assets exercised by the Worker test, pinned npm dependencies, Wrangler configuration, source/version metadata and SHA-256 checksums. The browser evidence artifact is separate. A failed run is not a verified candidate.

Extract the tarball into an empty directory, then run:

```sh
sha256sum -c build/SHA256SUMS
npm ci
npx wrangler login
```

Inspect `build/release.json`: version must be `0.3.0-rc.1` and source must match the successful run. Use that 40-character source value below. Do not rebuild or sync upstream before deploying this package.

```sh
npx wrangler deploy build/worker/worker.js --no-bundle --var SOURCE_COMMIT:PASTE_VERIFIED_40_CHARACTER_SHA
npx wrangler secret put ARCADE_TEACHER_PASSWORD
```

Enter the teacher password only at Wrangler's secret prompt (12–200 characters). Never put it in git, screenshots, a command-line argument or a student device. On the first deployment the classroom API stays unavailable until this secret exists. Deploying the package uses the account selected by `wrangler login`; verify that this is the intended existing Cloudflare account. No plan upgrade is included in this procedure.

For GitHub deployment, the manual **Deploy verified Cloudflare candidate** workflow accepts the successful verification run ID. Configure repository secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `ARCADE_TEACHER_PASSWORD` using the GitHub settings UI. Restrict the token to the intended account and Worker deployment permissions. The workflow requires a successful main-branch verification run, downloads its preserved package, checks hashes, deploys its prebuilt Worker/assets and verifies `/health`. It never deploys merely because upstream synchronization ran.

## Live checks

Use the HTTPS URL reported by Wrangler:

1. `/health` identifies `0.3.0-rc.1`, `cloudflare-durable-object`, and the exact verified source SHA.
2. `/?role=teacher` shows the same visible version/title. Sign in, create a test class with two students, open a session and scan its QR from another browser/device. Check the QR points at this same deployed origin.
3. Use the rotating password and teacher approval. Join as the second student with a newly generated password. Verify isolated progress, class/individual settings and pause/resume/end.
4. Open each game; check art/audio arrive, start/native gate behavior and Math Civ's gate-free built-in math. Reopen a saved campaign and verify progress. Use ordinary controls to delete only the disposable test class.

Live HTTPS/QR and physical iPad/school-network tests remain Not run until recorded. Synthetic Chromium and local workerd checks do not establish the school's route or physical Safari behavior.

## Storage, recovery and operating limits

The `teacher-workspace-v1` object retains classes, identities, token hashes, assignments, math evidence, round state and campaign saves across deploys. Do not rename the Worker, binding, namespace, object name or migration tag to troubleshoot an issue: that can point at an empty workspace. Existing round state resumes paused after object reinitialization. Export saved work from the teacher desk before destructive maintenance. The UI provides confirmed student/class/clear-all deletion; never delete a production Durable Object as a routine update.

The local Node database is not uploaded or reset by this deployment. No production Node installation was recorded before migration; any discovered external data requires a separate, explicit import plan.

This is one teacher workspace with the existing JSON model. Memory/CPU and request/storage usage depend on class activity and retained saves. The 23-client automated check covers identity isolation and simultaneous reads, not sustained school load or a cost forecast. Cloudflare's existing account quotas apply; no paid service tier is silently selected. Rate limits are per-object-instance minute windows, so object restart can reset them; they are abuse friction, not an account lockout guarantee.

To roll back application code, redeploy an earlier preserved **Worker** candidate using its own exact assets and source SHA. Do not run the pre-migration Node deployment against Durable Object storage. Current storage schema is version 1; keep the existing namespace and migration. Preserve an export first.

## Local verification

```sh
npm ci
npm run build
npm run check
npm test
npm run check:worker
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install chromium
```

Set `CHROMIUM_PATH` to Playwright's Chromium executable, run the seven `test/*browser.cjs` suites, then `npm run test:worker`. The Worker test runs the dry-run bundle in local workerd, uses a temporary isolated Durable Object directory and a dummy teacher password, restarts it to check persistence, and removes only its own test directory. For interactive development create ignored `.dev.vars` containing the teacher secret and run `npm run dev:worker`; use no real student records in development.
