# Math Arcade source baseline

Recorded 2026-10-01, Asia/Shanghai. These are retrieved repository references and documentation observations, not evidence of functional or hosted verification. No game source has been imported into this new project.

## Pinned references

| Component | Repository | Observed main commit | Intake evidence |
| --- | --- | --- | --- |
| Shared math and Olivia | williammcada/OLIVIA-MAGIC-BRACELET-QUEST | df28efce7bde25a239915af7db72b8b5caf85eb4 | Main ref retrieved; project brief and docs/SHARED-MATH.md read earlier in this conversation; current source must be inspected at import |
| Chrono Circuit | williammcada/CHRONO-CIRCUIT | ff5fbac605ad2f6c6aa3f76c3ecc3ecd77961e06 | Main ref and pinned docs/PROJECT-BRIEF.md read; documented application v0.9.1 |
| Vault 7, Nightfall, aerial shooter | williammcada/Math-Quest---Vault-7- | 6631cda52593fde611a3352489814f7d4bfbe3d3 | Main ref, tree and pinned project brief retrieved; source paths below are discovery targets |
| Math Civ | williammcada/Math-Civ | f2600f821a8ea194caea624548948d6ae2c98c9d | Main ref and project brief retrieved; documented v0.3.1 source identity below |
| Journey to the West | Unresolved | Unresolved | No exact source revision established in this intake; retrieve its current repository/branch and approved specification before integration |
| Robot side-scrolling shooter | Unresolved | Unresolved | No exact source revision established in this intake; do not import a guessed historical HTML |

Repository refs are observed snapshots. Other project work may continue; intentionally choose and record updated source before import. Reading a brief does not establish that all described functionality is implemented.

Math Civ's brief identifies `PLAY-SEKIGAHARA-0.3.1.html`, blob `ccffe181677be2334d6ff16678f696c5f85a3e66`, preserved at `b4095e8be208de5aae95706ec4e4c62c08ef753e`. Source bytes and proposal coverage still require inspection before adapter changes.

Discovered MathQuest paths include `public/games/nightfall/`, `public/games/aerial-shooter/`, `public/engine/held-input.js`, `public/aerial-practice-v0.2.0/`, `src/cartridges/nightfall/` and `docs/change-specs/aerial-shooter-v0.2.0.md`. Root files and public files can differ. Resolve the actual entrypoint/assets instead of picking a similarly named duplicate.

The aerial brief records v0.2.0 with five active minutes, 64 regular enemies and +10% player speed. This is documentation evidence, not a retest. Final game titles, including Coastal Escape, must be reconciled with the selected source release.

Chrono's brief records three gates per stage, default two questions per gate (configurable 1–10), and configuration frozen per run. Preserve trigger/progress structure; shared-catalog migration and configurable defaults require explicit adapter work. Do not replace its existing native rules with the mini-game admission loop.

## Handbook consultation

Baseline: [c50115ba1fea9cb552f3ad1415e670a219118b56](https://github.com/williammcada/mcada-project-handbook/tree/c50115ba1fea9cb552f3ad1415e670a219118b56).

| File read | Identified blob where captured |
| --- | --- |
| AI-START-HERE.md | 6557a45aaa6d29d7d1abde808e6d0ac248b08820 |
| UNIVERSAL-RULES.md | 6bde7c1f4ccdf5ed2163955e553379ba55186e2f |
| CONDITIONAL-STANDARDS.md | 1a794984142f3702c027a28e492a310aaba9f096 |
| RELEASE-CHECKLIST.md | 8aeb2207fb48b65ed9454da370c6021499fcd7d0 |
| PROJECT-TEMPLATE.md | Read at the pinned baseline |
| PROJECT-MAP.md | Read at the pinned baseline earlier in this conversation |
| GLOSSARY.md | Read at the pinned baseline earlier in this conversation |

U-09, U-10 and S-03-M are explicitly applicable approved rules. S-03-A retains its limited timing scope. Other selected seeded/draft sections are used within this project, without claiming new global approval. No handbook file was modified.

## New-project baseline

Initial local design checkpoint: `5343f1b528a3a2bbc8e040085feced4367abf022`, preserved in the previously delivered design archive. The owner created the private canonical repository `williammcada/Math-Arcade` on 2026-10-01 with initial commit `27128c2c4ab3b6f001cbdd2287eddc88067fa45d`. The documentation upload uses that commit as its parent and updates repository-status wording without changing the agreed design. See GitHub history for the resulting design checkpoint. There is no running Math Arcade version.

## alpha.1 implementation import — 2026-10-01

The pilot imports the actual shared engine, 240-skill catalog, mathematics formatting and dependencies from Olivia commit `df28efce7bde25a239915af7db72b8b5caf85eb4`. Coastal Escape core, rendering, assets, audio and shared held-input modules come from MathQuest commit `02acd2cdf065adf33df4a2dd90094ef4381ce39a`, which advanced after the design baseline. `vendor/manifest.json` pins all 52 files and their Git blob hashes. `npm run build` verifies them before generating JavaScript. Upstream files are unchanged. The Arcade host and backend are separate new code.

QR encoder provenance is recorded in THIRD_PARTY.md. No other game has been imported in this pilot.

## alpha.2 Vault 7 import — 2026-10-01

Arcade baseline `d3040d129ac54c0d4371d4313de5ddcec74f5b55`; MathQuest source `59c11c90c2f0893333dfe30b62578fd73deb9bbf`. Import six unchanged files: stealth core, original runtime (build input only), hardware rendering, agent sprite, finale music and cover art. Manifest hashes cover all 58 vendor files. The build extracts the original runtime drawing method and accessible-scene function; the old MathQuest network/storage host is not shipped. Existing controls and held-input blobs match this source revision, so both games share the already pinned modules.

Reconsulted AI-START-HERE.md, UNIVERSAL-RULES.md, relevant CONDITIONAL-STANDARDS.md sections and RELEASE-CHECKLIST.md at handbook `c50115ba1fea9cb552f3ad1415e670a219118b56`; MathQuest AGENTS.md, brief and relevant v0.9.2/v0.9.4 source specifications inspected. No handbook or source-game repository changes.

## alpha.3 Nightfall import — 2026-10-01

Arcade baseline `c947c1c9254bde26ad73037319a3c1f4a51ebf0c`; MathQuest remains `59c11c90c2f0893333dfe30b62578fd73deb9bbf`. Canonical `public/games/nightfall` modules and city media: 22 additional unchanged files, 80 total hashed vendor files. `rescue-world.js` is included because the city world imports it; no early-rescue host/campaign is enabled. Build normalization removes version query strings and adjusts import/media URLs only. Existing shared control profiles, held-input and GameAudio are reused.

Consulted current upstream AGENTS.md, PROJECT-BRIEF and relevant v0.9.2 encounter/timing and v0.9.4 chapter requirements. Reconsulted handbook AI-START-HERE, UNIVERSAL-RULES, applicable CONDITIONAL-STANDARDS and RELEASE-CHECKLIST at `c50115ba1fea9cb552f3ad1415e670a219118b56`. No upstream repository or handbook modifications.

## Journey source resolved after alpha.3

Recovery branch `recovery/journey-stage1-20261001` at `316189b94dd2e0d73fd1dc605242ef40bb5167ff` in MathQuest contains the experimental multiplayer stage-1 prototype. Main and the original design branch are not that implementation. See [source intake and integration boundaries](checkpoints/journey-intake.md). Journey remains disabled until its Arcade bridge is implemented and verified.
