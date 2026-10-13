# Math Arcade on Render

Math Arcade's student front door is a free Render web service, `mcada-matharcade`, defined in the repository's `render.yaml`. It relays the whole site to the existing `math-arcade` Cloudflare Worker using the same relay function as the Netlify entry point (`netlify/edge-functions/arcade-proxy.js`). Class data stays in the Worker; nothing is stored on Render. Specification: [render-front-door-2026-10-14](change-specs/render-front-door-2026-10-14.md).

- Teacher entry: `https://mcada-matharcade.onrender.com/?role=teacher`. Students scan the QR code the teacher page shows; it uses the same address.
- Relay check: `https://mcada-matharcade.onrender.com/__relay/health` (answered by Render; reports relay version and source commit).
- Worker check through the relay: `https://mcada-matharcade.onrender.com/health` with response header `X-Arcade-Entry: render`.
- The free service sleeps after 15 minutes without traffic and takes about a minute to wake. Open the teacher page a minute before class.
- Deploys happen only when `hosting/render/**`, the relay function or `render.yaml` change; the hourly game sync does not redeploy Render.
- The Worker itself is still deployed by the existing GitHub workflow, unchanged.

If Render ever assigns a different address than `mcada-matharcade.onrender.com`, nothing in the relay needs changing (it uses the address it is served from), but update this page, the forwarding page in `hosting/netlify-forwarding/`, and the README.
