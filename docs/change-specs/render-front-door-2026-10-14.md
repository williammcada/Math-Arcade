# Math Arcade student front door on Render — change specification

**Stage:** Approved 14 October 2026 (Asia/Shanghai); implementation checkpoint on `implement/render-hosting`. Hosted and school-network checks are Not run until recorded.
**Owner:** William McAda · A WILLIAM MCADA PRODUCT
**Source baseline:** `main` at `bc477d1` (Math Arcade 0.5.0).
**Handbook consulted:** `williammcada/mcada-project-handbook` at `7e134a8` — AI-START-HERE, UNIVERSAL-RULES (U-01, U-07, U-08, U-12), CONDITIONAL-STANDARDS (S-04).
**Related:** the same move for MathQuest and Applied Math Projects, each under its own specification.

## 1. Purpose

Netlify's credit-based plan charges for every production deploy. Math Arcade's hourly upstream sync pushes to `main`, so the Netlify project redeploys many times a day. The owner is moving the student front door to Render.

## 2. Owner decisions — 14 October 2026

| Question | Decision |
| --- | --- |
| Front door | Render, free Node web service `mcada-matharcade` → `https://mcada-matharcade.onrender.com` |
| Backend | Unchanged: Cloudflare Worker `math-arcade` and its `ArcadeWorkspace` Durable Object (all class data) |
| Network | Owner tested `onrender.com` on student iPads on the school Wi-Fi: it works |
| Netlify | Remains an acceptable student host; Arcade moves off it to stop credit use |

## 3. Why a web service, not a static site

The Arcade uses HttpOnly login cookies, and its Worker accepts a POST only when the `Origin` header is the Worker's own address. The Netlify Edge Function rewrites that header after checking the browser's real origin. A Render static-site rewrite cannot do this, so the same relay runs as a small Node program.

## 4. Changes

1. **`hosting/render/relay.mjs` (relay 1.0.0):** a zero-dependency Node server that imports and runs the existing Netlify relay function unchanged (`netlify/edge-functions/arcade-proxy.js`): one fixed upstream, same-origin POST check, cookies and bytes preserved, only upstream redirects rewritten, no shared caching. Around it, the Node adapter:
   - strips Render's edge headers (`X-Forwarded-*`, `Rndr-Id`, `True-Client-IP`) before forwarding;
   - returns every `Set-Cookie` separately;
   - recompresses text responses (HTML, JavaScript, CSS, JSON, SVG) with Brotli or gzip when the browser accepts it, because Node decodes the Worker's compressed responses and Render's free plan has a 5 GB monthly bandwidth allowance; images and audio pass through unchanged;
   - answers `/__relay/health` itself (relay version, upstream, source commit) so Render's health checks never wake the Worker;
   - labels responses `X-Arcade-Entry: render`.
2. **`render.yaml`:** web service `mcada-matharcade`, `plan: free`, build `node --version` (nothing to install), start `node hosting/render/relay.mjs`. A build filter redeploys only when the relay, the shared relay function or `render.yaml` change, so the hourly sync does not redeploy it.
3. **`package.json`:** `check` also syntax-checks the relay; `start:render` runs it locally.
4. **Tests:** `test/render-relay.test.mjs` (6 tests).
5. **Records:** README hosting line, project brief section, `docs/RENDER.md` (owner setup and checks).
6. **Old address:** after verification, the Netlify project gets one manual deploy of `hosting/netlify-forwarding/` (every path forwards to the same path on Render) and its builds stay stopped.

No Worker, frontend, game, campaign or Math Engine code changes. The Arcade's own QR codes already use the page's own address (`location.origin`), so they follow Render automatically.

## 5. Must retain

Teacher sign-in and class data; four-letter join password and admission; every game, campaign and asset path; pause/resume and reload; existing Worker deploy workflow, verification and hourly sync.

**Known, accepted limitations:**
- Cookies belong to one address. Teachers and students sign in again on the Render address; class data is unaffected because it lives in the Worker.
- A free Render service sleeps after 15 minutes without traffic and takes about a minute to wake. Open the teacher page a minute before class; once anyone is using it, it stays awake.
- All requests reach the Worker from Render's address instead of Netlify's. The Worker's per-address limits (for example 120 joins a minute) applied to one relay address before as well; behaviour is unchanged.

## 6. Out of scope

Running the full Arcade server on Render (needs a paid instance and disk and moves data off Cloudflare); keeping the service awake on a schedule; a custom domain; any gameplay change.

## 7. Verification

| Check | Who | Status |
| --- | --- | --- |
| Relay tests: POST body, cookies, origin rewrite, multiple Set-Cookie, edge-header stripping, off-origin refusal, PUT refusal, binary bytes unchanged, Brotli/gzip/plain text, HEAD, redirect rewrite and refusal, Worker unreachable, local health check, public-origin derivation | Claude | Passed (6/6), plus the 2 existing Netlify relay tests |
| `npm run check` | Claude | Passed |
| Full `npm test`, build and browser suites | GitHub CI on the pull request | Locally Not run: the build fetches pinned game files from GitHub's raw-file host, which this workspace cannot reach; the 11 affected suites fail only for missing build output |
| Render deploys from `main`; `/__relay/health` reports relay 1.0.0 and the merged commit | Claude after owner setup | Not run |
| `/health` through Render reports the Worker's version with `X-Arcade-Entry: render`; no browser request goes to `workers.dev` | Claude | Not run |
| Teacher signs in, opens a class; a second device redeems the password, is admitted, completes a gate and launches a game; pause/resume and reload | Owner | Not run |
| Old Netlify paths forward to the matching Render path | Claude after forwarding deploy | Not run |
| Student iPad on school Wi-Fi plays from the Render address | Owner — required before classroom use | Not run |

## 8. Rollback

The Netlify project keeps its last working relay deploy until the forwarding deploy replaces it. Before that, students can still be given the Netlify address. After it, redeploy the previous Netlify deploy from Netlify's Deploys list ("Publish deploy").

## 9. Release workflow

DESIGN → CHANGE SPEC (this document) → IMPLEMENT → CHECKPOINT ("Math Arcade Render front door implementation checkpoint") → VERIFY (§7) → VERIFIED CHECKPOINT → RELEASE → DEPLOY (Render live; Netlify forwarding; owner school-network check).
