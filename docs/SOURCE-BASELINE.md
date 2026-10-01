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
