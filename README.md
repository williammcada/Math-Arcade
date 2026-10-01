# Math Arcade

**A WILLIAM MCADA PRODUCT**

Teacher-controlled classroom games with shared mathematics practice and individual student assignments.

**Target:** v0.1.0. **Current version:** v0.1.0-alpha.3 — classroom, Coastal Escape, Vault 7 and Nightfall integrations, locally tested. Five other games remain pending; this is not a deployed or classroom-verified release. The canonical repository is [williammcada/Math-Arcade](https://github.com/williammcada/Math-Arcade), created by the owner on 2026-10-01.

Run locally with Node 24: `npm run build`, set `ARCADE_TEACHER_PASSWORD` (12+ characters), then `npm start`. Open `http://localhost:3000/?role=teacher`. See [running and hosting instructions](docs/RUNNING.md) and [current scope](docs/checkpoints/alpha.3.md).

## Classroom workflow

The teacher opens a session from a computer, chooses available games and class math settings, and displays a QR code or join code. Students join on iPads. The teacher can open any student's Math Practice panel and assign different skills. Assignments and progress follow the student across games.

| Game | Mathematics in Math Arcade |
| --- | --- |
| Vault 7 | One gate before each new round; implemented stealth extraction |
| Nightfall | One gate before each new round; implemented city mission |
| Journey to the West | Each participant completes a gate before joining a new round |
| Aerial shooter / Coastal Escape | One gate before each new round; implemented pilot |
| Robot side-scrolling shooter | One gate before each new round; final display name checked against imported source |
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
