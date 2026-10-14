# Math Arcade Render front door — deployment record

**Live:** https://mcada-matharcade.onrender.com/ · **Deployed commit:** `7df8f0b` (merge of implementation checkpoint `220e783`) · relay 1.0.0 · Worker `math-arcade` 0.5.0 (source `e0f9c8e`, unchanged)
Checked 14 October 2026 (Asia/Shanghai) by Claude in the owner's built-in desktop browser (Chromium, desktop). Not a physical iPad or school-network test.

| Check | Result |
| --- | --- |
| `/__relay/health` reports relay 1.0.0, upstream `math-arcade.willmcada-apps.workers.dev`, source `7df8f0b` | Passed |
| `/health` through the relay: Worker 0.5.0, `X-Arcade-Entry: render`, `Cache-Control: private, no-store` | Passed |
| Same-origin POST (`/api/logout`, student role, no session) accepted by the Worker after the relay's origin rewrite → 200 | Passed |
| Text compressed for the browser (`app.js`, Brotli) | Passed |
| Teacher page `Math Arcade v0.5.0` loads; every request stayed on `mcada-matharcade.onrender.com` (no `workers.dev`) | Passed |
| Teacher sign-in, class, password redemption on a second device, admit, gate, game launch, pause/resume, reload | Not run (owner) |
| Old Netlify address forwards to Render | Not run — forwarding deploy pending |
| Student iPad on school Wi-Fi | Not run (owner) |
