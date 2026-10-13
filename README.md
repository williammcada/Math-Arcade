# Math Arcade v0.5.0

**A WILLIAM MCADA PRODUCT**

Release moving all Arcade mathematics onto the Math Engine (0.34.0-rc.3, MATH-ENGINE `10127fc`), the same build MathQuest 0.10.0 uses. See the [v0.5.0 specification](docs/change-specs/v0.5.0.md) and [release notes](docs/releases/v0.5.0.md).

- **Kindergarten to Algebra 2.** Teachers can browse K–7 skills by grade, each course from Intermediate 4 to Algebra 2 (with lesson names, in teaching order), and extras. Existing class settings and student progress keep working.
- **Engine-checked answers.** Questions, answer checks and rendering come from the engine on the server; gates show the keys each answer needs.

Previous release, v0.4.1: smoother action play, no 1.5-second freezes, consistent Olivia/Chrono gates. Verified candidate `e454e9c` ([evidence](docs/checkpoints/v0.4.1.md)). Deployed to Cloudflare 13 Oct 2026 (run 38314133992); owner playtest confirmed smooth animation.

## v0.4.0 summary

Ten-game implementation: Nightfall 1: Last Bus Out and Nightfall 2: False Haven are separate entries; Journey to the West is single player; Blackline: Last Exit is included. Existing seven games and classroom controls are retained.

Hosting: the existing Cloudflare Worker plus a separate same-origin [Netlify entry point](docs/NETLIFY.md). See [v0.4.0 specification](docs/change-specs/v0.4.0.md).

## Earlier release documentation

# Math Arcade

**A WILLIAM MCADA PRODUCT**

Teacher-controlled classroom games with shared mathematics practice and individual student assignments.

**Current candidate: v0.3.0-rc.1** — Cloudflare Worker + Durable Object, seven integrated games, canonical MATH-ENGINE practice, and single-use classroom passwords. Saved source is not a hosted deployment. Physical iPad and school-network checks remain pending. Math Civ retains built-in mathematics and has no additional Arcade gates; Journey to the West is excluded.

Run locally with Node 24: `npm run build`, set `ARCADE_TEACHER_PASSWORD` (12+ characters), then `npm start`. Open `http://localhost:3000/?role=teacher`. See [running and hosting instructions](docs/RUNNING.md) and [current scope](docs/change-specs/v0.3.0.md).

Production hosting uses the [Cloudflare deployment guide](docs/CLOUDFLARE.md). Node remains a local/reference host.

## Classroom workflow

The teacher opens a session from a computer, chooses available games and class math settings, and displays a QR code or join code. Students scan the QR on iPads and enter the current four-letter password. It expires after 45 seconds and admits one device only. A used password remains consumed; the teacher can click New password to admit the next student immediately. Teacher approval confirms student identity; existing students stay connected when passwords change. The teacher can open any student's Math Practice panel and assign different skills. Assignments and progress follow the student across games.

| Game | Mathematics in Math Arcade |
| --- | --- |
| Vault 7 | One gate before each new round; implemented stealth extraction |
| Nightfall | One gate before each new round; implemented city mission |
| Aerial shooter / Coastal Escape | One gate before each new round; implemented pilot |
| Robot side-scrolling shooter | One gate before each new round; implemented as Ironbreak |
| Chrono Circuit | Existing gates and progression structure |
| Olivia's Magic Bracelet Quest | Existing gates and progression structure |
| Math Civ — Sekigahara | Built-in math; no added entry, death, replay or periodic gates |

Math Civ remains under teacher access and session controls. Its campaign math is not replaced by the shared skill assignment.

## Project records

- [Project brief](docs/PROJECT-BRIEF.md)
- [v0.1.0 specification](docs/change-specs/v0.1.0.md)
- [Source baseline and consultation record](docs/SOURCE-BASELINE.md)
- [GitHub checkpoint and continuation](docs/GITHUB-SETUP.md)
- [Verification record](docs/VERIFICATION.md)

The latest owner decisions in the v0.1.0 specification replace the earlier suggestion of several gates before a mini-game: there is one gate with a teacher-selected question count before each round.

## Delivery

Planned delivery is a hosted application with a backend, teacher dashboard, student interface and persistent records. Render is the preferred candidate from the design conversation; hosting configuration, service costs and school-network suitability must be established before deployment. Classroom settings change through the dashboard without a code deployment.

DESIGN → CHANGE SPEC → IMPLEMENT → CHECKPOINT → VERIFY → VERIFIED CHECKPOINT → RELEASE → DEPLOY.

Preserve source checkpoints and verify the actual hosted application and physical target devices before claiming classroom readiness.

## Canonical updates

The classroom question bank comes directly from the unchanged MATH-ENGINE practice bundle (Math Engine 0.34.0-rc.3: 312 K–7 skills, 1,441 course items Intermediate 4 → Algebra 2, 10 extras). Questions, rendering and answer checks all come from it, server-side. Game snapshots come from mathquest, CHRONO-CIRCUIT , OLIVIA-MAGIC-BRACELET-QUEST and Math-Civ; source commits and exact blob hashes are recorded in `vendor/manifest.json`. Upstream sources are never edited in this repository.

GitHub Actions checks upstream hourly, or on manual/repository-dispatch request. It promotes updated snapshots only after the build, server tests and seven browser suites pass. Failed candidates leave main unchanged and appear as failed Actions runs. GitHub may delay scheduled runs; this is checked periodic synchronization, not instantaneous delivery. New games require an explicit adapter; the workflow updates the seven integrated games. Deploy from a passing commit between classroom sessions. `npm run sync:upstream` refreshes local snapshots; run the same checks before committing.

The candidate-verification workflow builds the complete committed snapshots and runs regression tests without requiring upstream repository access. Its results are distinct from the hourly synchronization workflow, which still needs successful authenticated access to all private canonical repositories. See [Math Civ checkpoint](docs/checkpoints/v0.2.1.md) for verification limits.
