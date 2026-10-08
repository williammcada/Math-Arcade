# Math Arcade accessible entry point

v0.4.0-rc.1 keeps the existing math-arcade Worker and its saved classroom data. A separate Netlify project serves the complete site through `netlify/edge-functions/arcade-proxy.js`. Browsers, QR links, artwork, same-origin APIs and secure HttpOnly cookies stay on that project's public Netlify origin. No browser request needs to contact workers.dev. This uses MathQuest's relay approach while preserving Arcade's cookie-based sessions. Do not replace `vault7mathquest` or edit MathQuest's relay.

## One-time setup

1. In Netlify, choose Add new project → Import an existing project → GitHub.
2. Select `williammcada/Math-Arcade`, branch `main`.
3. Let the repository's `netlify.toml` supply the build command, publish directory and Edge Function. No new environment variables or tokens are required. Publish the project on the existing free/account allowance; do not accept a paid upgrade.
4. Copy its actual `https://…netlify.app` address. Teacher entry is `/?role=teacher`; students use the teacher's QR code generated from that same address. Existing class data remains; sign in again on this new origin. Existing devices on workers.dev do not need their data reset.
5. Verify `/health` identifies the expected runtime/source and response header `X-Arcade-Entry: netlify`. Sign in, open the class, redeem its four-letter password on a second device, Admit, complete a gate and launch each new game. Test pause/resume, reload, artwork and protected campaigns without requests to workers.dev.

A static drag-and-drop of only `hosting/netlify/public` is insufficient: the Edge Function must deploy. No Netlify account is authenticated in the agent browser at this checkpoint. Configuration being saved is not proof that a Netlify deployment exists. Actual Netlify URL and hosted checks must be recorded after publishing.

## Security and recovery

The proxy has one fixed upstream. It refuses off-origin writes before forwarding, retains cookies and streamed content, rewrites only same-upstream redirects, and prevents shared caching. Worker origin checks still apply after the proxy's validated rewrite. No wildcard CORS or plaintext credentials are added. The same Durable Object binding/name and schema remain. Roll back the Worker with the preserved candidate artifact if needed; no data reset or new namespace is required.

## Source snapshots

The additional Journey, Blackline and False Haven art snapshots are pinned by full source commit and Git blob digest in `vendor/manifest.json`. `scripts/fetch-vendor.mjs` materializes omitted files before the full integrity check/build; it never resolves a moving branch. They are included in the final tested Worker/assets archive. Hourly source sync updates the pinned manifest only after the full checks pass. Build failures do not deploy.

The owner-approved v0.4 implementation checkpoint has a one-release opt-in: after its exact Verify workflow succeeds, the existing deployment workflow deploys the preserved artifact using the already configured secrets. The exact commit-message condition does not match routine upstream sync or future revisions; those remain manual.
