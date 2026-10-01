# Math Arcade v0.1.0-alpha.1 — classroom and Coastal Escape pilot

Implementation starts from GitHub design checkpoint `215089cfb1804180f865a8451e8704197833ee2e`. This implements the first classroom foundation and one-game integration. The eight-game product remains the full target.

## Implemented scope

- One teacher workspace; multiple classes, rosters, session code/QR, device admission, session pause/resume/end and game availability.
- Shared K–7 catalog imported byte-for-byte from Olivia `df28efce7bde25a239915af7db72b8b5caf85eb4`; class defaults, individual overrides, replace-everyone, restore inheritance, search/selection and sequential per-skill preview.
- Server-side shared answer checking, fixed gate snapshots, progression state, retry evidence and one-use admission. Preview does not receive learner state.
- Coastal Escape from MathQuest `02acd2cdf065adf33df4a2dd90094ef4381ce39a`: unchanged core, art, audio and input mechanism; new Arcade host. Standard action mode and loadout, existing in-round pickups, three lives and five-minute cumulative simulation. Every new round requires one gate. No mid-round upgrade gates.
- Server-owned simulation and SQLite checkpoints; student rendering predicts between authoritative updates. Reconnect requires resume and does not mint a new round. One admitted device per student; teacher approval of a replacement revokes the old connection.
- Export records and delete a student, class or all classes with scoped UI confirmation. SQLite uses a persistent file and WAL.

## Technical choices

Node 24 with built-in HTTP, SQLite, crypto and TypeScript stripping. No npm runtime packages. `npm run build` verifies the Git blob hash of every pinned source file before compilation. Generated build output is reproducible and ignored by Git. Import source changes through the upstream manifest; do not edit vendor code independently.

Teacher authentication uses an environment-provided password with scrypt verification and HttpOnly SameSite cookies. Student credentials are random and stored hashed. Mutations require same-origin JSON; role and roster scope are checked server-side. Set PUBLIC_ORIGIN explicitly for production. The password is never sent to student clients.

Classroom synchronization currently uses short HTTP polling. Physical-device/network performance remains a release gate. Use one service instance with its own persistent disk; this pilot's singleton SQLite state is not a horizontally scaled multi-teacher service.

## Source-informed limitations

The pinned current shared engine supports General/Targeted Review and Fixed Progression, with retry and prerequisite behavior. It does not expose a configurable worked-example-after-two-misses feature; this pilot does not claim it does. The teacher panel retains that engine's actual current selection behavior. A synchronized upstream extension is required before adding new shared assistance controls.

The upstream assisted-flight path is not exposed by this first Arcade host; it needs a separate accessibility integration.

Seven games display Coming next and cannot be launched. Their policies remain documented, including Math Civ's no-added-gate exemption. The pilot does not claim those games are integrated. Chrono's final assignment boundary must be reconciled with its concurrent shared-math migration before import.

Student self-claim requires a teacher Admit action. Roster names are available to holders of the current class code; their practice history is not. Records remain until teacher deletion; there is no automatic retention purge. Export produces JSON; restore/import is not yet offered. Each learner's shared engine retains the latest 5,000 events as in upstream.

A lost connection pauses the game after a 1.5-second command lease; the client pauses immediately on a failed request. Teacher commands apply on the next poll, rather than claiming literally zero network latency. Local pause, backgrounding, stale connection and teacher pause all require fresh input.

## Verification

Preserve an implementation checkpoint before extended testing. Run `npm run build`, `npm run check`, `npm test` and the browser workflow in `test/browser.cjs`. Record exact results and source identity in the verification record. Synthetic browser checks do not verify physical iPad/iPhone behavior or the school's Wi-Fi path.
