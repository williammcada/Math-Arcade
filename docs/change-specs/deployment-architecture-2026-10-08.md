# Deployment architecture decision — 2026-10-08

Status: historical comparison. Owner subsequently approved the Cloudflare migration with “Yes”; see v0.3.0.md for the implementation contract. Earlier unresolved-choice and sync statements below describe the previous checkpoint.

## Verified source

Math Arcade main `e3d55b80a51138cbbc3dca5a7c5f0324bb4d818a` contains the tested `b88e677` application plus evidence documentation. Both candidate workflows completed successfully. MathQuest inspected at `cd35fd912fbde2007f8fade6b93b1c2a1421275c`: `wrangler.jsonc`, `src/worker.js`, `AGENTS.md`, and project brief.

| Concern | Math Arcade now | MathQuest now |
| --- | --- | --- |
| Server runtime | Node 24 HTTP server | Cloudflare Worker |
| Persistent state | Local node:sqlite database; persistent disk required | SQLite-backed Durable Objects: QuestSession and BrawlRun |
| Delivery | One origin serving app, protected adventures and JSON API | GitHub Pages frontend, existing academic relay, Cloudflare session service |
| Authentication | Same-origin HttpOnly teacher/student cookies | Existing MathQuest room/team credential protocol |
| Deployment material | Dockerfile and proposed Render instructions | wrangler.jsonc for mathquest-prototype |

Shared game snapshots and input modules do not establish deployment or network equivalence. The Node application cannot be uploaded unchanged as the existing MathQuest Worker.

## Owner instruction

Owner authorized continuing and assuming iPad/network operation for now **if the platform uses the same architecture as MathQuest**. That condition is not currently satisfied. Preserve the actual test status as Not run. The instruction is a conditional operational acceptance, not evidence of a test pass. Ask which hosting direction to use; do not make the migration or provision a separate paid host on an unstated assumption.

## Recommended option: align with Cloudflare

Proposed scope, not yet approved or implemented:

1. Retain the verified game/UI/Math Engine candidate. Introduce a runtime-neutral model/storage interface and port HTTP routing to Worker request/response handling.
2. Add a separate Arcade Worker and Durable Object namespace in the existing Cloudflare account. Keep MathQuest's live rooms, Worker and bindings intact.
3. Preserve atomic single-use password redemption, identity replacement, exclusive campaign leases, teacher controls, server-authoritative rounds and all saved data/deletion behavior. Adapt authentication to supported cryptographic APIs without weakening secrets or cookie protections.
4. Decide frontend/relay routing explicitly. Reusing Cloudflare alone does not establish identical school-network paths. Do not move the existing same-origin cookies to a cross-origin relay without a deliberate credential design and tests.
5. Run the existing regression suite against the Worker implementation and test persistence/restart, competing joins, asset protection and host-origin behavior. Preserve implementation and exact verified checkpoints before deployment.
6. Deploy via authenticated Cloudflare access; verify the actual HTTPS endpoint, QR joining, teacher/student sessions and restart persistence. Record physical iPad and school-network checks as deferred under the owner's conditional acceptance only after the intended architecture is agreed.

This retains the existing infrastructure family but requires backend implementation before deployment. No cost or plan guarantee is implied.

## Alternative: deploy the current Node candidate

Keep current architecture and deploy one Node/Docker service with persistent disk and HTTPS. This is the shorter implementation path but requires separate hosting configuration and acceptance of its cost. The owner must explicitly extend their test deferral to this different network architecture.

## Synchronization status

There has not yet been a hosted run of Sync canonical games and math in the retrieved Actions history. Candidate verification is successful but does not clone other private repositories. The sync script clones MATH-ENGINE, mathquest, CHRONO-CIRCUIT, OLIVIA-MAGIC-BRACELET-QUEST and Math-Civ; authenticated read access to those repositories must be configured and tested. Do not equate installed schedule configuration with successful synchronization. Preserve last-passing snapshots if update checks fail.

## Handbook consultation

AI-START-HERE.md, UNIVERSAL-RULES.md, CONDITIONAL-STANDARDS.md (selected S-02/S-03/S-04), and RELEASE-CHECKLIST.md at `fd4330863f4cc0812180fbf1de122970a42c7885`. New U-01 HTML version amendment applies to future changed/generated HTML. No HTML/runtime modification in this decision record. No handbook rule changed.
