# Project brief — Math Arcade

**Brief version:** 0.3.0-rc.1
**Date:** 2026-10-01, Asia/Shanghai
**Owner:** William McAda
**Canonical repository:** `williammcada/Math-Arcade`
**Source:** New integration project; upstream references are pinned in [SOURCE-BASELINE.md](SOURCE-BASELINE.md). Pilot integration is detailed in [alpha.3](checkpoints/alpha.3.md).
**Handbook baseline:** `8fc5e3b6cd163278dd618081333f2264bf392db6`, consulted for the Math Civ continuation.

## Current checkpoint — 2026-10-08

v0.2.1-rc.1 integrates seven games through canonical snapshots, 312-skill MATH-ENGINE practice, QR plus single-use four-letter passwords (45 seconds), and checked hourly upstream synchronization. Math Civ uses its own mathematics without extra gates; Journey remains excluded. No live deployment or physical-device verification is claimed. The current integration contract is [v0.2.1](change-specs/v0.2.1.md), extending [v0.2.0](change-specs/v0.2.0.md); older checkpoint descriptions below are historical.

## Purpose and audience

Provide a classroom reward arcade that the teacher controls from one computer. Students use iPads to play existing games and complete the mathematics assigned to them. Keep daily operation simple: open a session, choose content and games, display a join code, and adjust individuals from the roster.

## Scope

The full target includes Vault 7, Nightfall, Journey to the West, the aerial shooter, the robot side-scrolling shooter, Chrono Circuit, Olivia's Magic Bracelet Quest and Math Civ. Integration proceeds in identifiable checkpoints. The owner excluded Journey to the West on 2026-10-01. The current requested roster has seven games.

Implement a backend, teacher authentication, classroom sessions, student identity/reconnect, class defaults, individual math overrides, game availability, pause/resume/end, shared practice, progress storage and saved-work deletion. Use the shared Olivia/Mega Man mathematics implementation identified by handbook S-03-M. Mega Man is a math-system reference and is not included as a game in this approved roster.

Use [v0.1.0](change-specs/v0.1.0.md) as the consolidated implementation contract. Preserve the native MathQuest cartridge editions; the Arcade editions have their own host policy.

## Required behavior

- Students join by QR code or class code; teacher credentials never need to be entered on student iPads.
- Teacher chooses a broad class skill set or opens a student's Math Practice panel to customize it.
- Show Class settings, Individual settings, effective skills and pending application status on the roster.
- Updating the class default preserves individual assignments. Assign to everyone explicitly replaces individual assignments. Use class settings removes an individual override.
- Mini-games use one gate before each new round; the teacher sets questions per gate. No extra questions interrupt a live round.
- Each game defines its terminal conditions. A respawn that belongs to the same round is not a new round. Terminal death, exhausted lives, expiry or victory returns to the next start gate.
- Chrono Circuit and Olivia retain their established gate locations, death/retry credit and progression structure.
- Math Civ has no added gate of any kind. Retain its authored mathematical decisions, campaign, consequences and save structure. Its card and reports say Built-in math.
- Teacher availability, pause and session-end rules apply to every game, including Math Civ.
- Refresh, reconnect, switching games and switching browser tabs must not duplicate rewards, erase credited work or create free new rounds.

## Devices and operation

Target teacher desktop browsers and student landscape iPad Safari. Preserve keyboard and touch controls; inherited gamepad support remains where implemented. iPhone review support is checked per game and must not be advertised as verified without physical-device evidence. Do not create an offline classroom-control promise: teacher-controlled sessions require the backend.

Keep mathematics readable with fractions, exponents, units and usable answer entry. Preserve game art, audio, controls and accepted gameplay. Use one shared input-recovery implementation in the Arcade codebase wherever compatible; preserve game-specific mappings.

## Saved work

Store classes, stable student identifiers and display names, assignments, practice attempts, round grants, game saves and session records. Proposed initial operation uses classroom identifiers without student email/password accounts. Teacher-controlled identity recovery prevents a lost browser token from silently creating a new learner.

Provide deletion for individual records, complete classes/sessions/campaigns where appropriate, and clear-all within the teacher workspace. Identify affected scope and counts, require confirmation and allow cancellation. Offer export before irreversible deletion; do not imply deleted data is recoverable. Remove associated records without orphaning them and preserve unrelated classes and source game assets.

## Selected handbook rules

Apply U-01–U-08 within this project; they are seeded handbook rules, not newly ratified global rules. Apply approved U-09 deletion, U-10 held-input/native-menu/viewport requirements and U-11 story/instructions separation. Select S-02, S-03 and S-04; apply approved S-03-M to shared mathematics. Use S-03-A's five-minute action default for new or explicitly retimed action rounds, while recording preserved existing round limits per imported game. Do not impose five minutes on Math Civ campaigns or whole Chrono/Olivia adventures.

S-01 external AI import and S-05 applied-project rules are not selected. No handbook amendment is made by this package.

## Conflicts and explicit scope

| Existing rule or design | Math Arcade treatment |
| --- | --- |
| Earlier conversation suggested several gates before a mini-game | Superseded by the owner's one start gate per round instruction; customize questions per gate |
| MathQuest's cartridge narratives, gates and one-run/retry rules | Native editions remain intact; Arcade uses the new round admission policy |
| Shared practice for every hosted game | Owner explicitly exempts Math Civ: built-in math, no added gates |
| Math Civ and Chrono standalone briefs say no backend | Arcade adds an online host integration; this does not change standalone distribution requirements |
| Chrono currently freezes configuration for an entire run | Preserve that snapshot by default; show changes as queued for the next run/relay. This refines the earlier blanket next-gate recommendation using current source documentation |
| Olivia/shared math snapshots a gate | Apply incoming changes at the next new gate; preserve an active gate and earned credit |
| Ongoing upstream game development | Import pinned source states and record updates explicitly; never reconstruct games from chat |

## Definition of done

Every listed game has an identified source revision, implemented adapter and evidence for its required gate policy. Teacher + student workflows pass with class and individual assignments; Math Civ produces no synthetic gate events. Reconnect, replay admission, permission isolation, saves and deletion pass. Separate physical iPad checks cover stuck input, native browser interference and viewport stability. Test the actual school network and classroom concurrency before claiming readiness. The live version must identify the exact verified source candidate.

## Known limits

The three-game pilot has local application and browser evidence in VERIFICATION.md. No hosted Math Arcade service or physical-device/classroom-network verification exists yet. Journey to the West source is now identified in [its intake](checkpoints/journey-intake.md); its Arcade integration remains pending. The robot shooter source revision remains unresolved in the initial intake. The linked shared-math overview still labels itself v1 while Olivia's project brief records later v2 work; inspect current source and manifests before importing.

## alpha.2 Vault 7 implementation

See [approved integration scope](change-specs/v0.1.0-alpha.2.md). Preserve the historical three-minute action limit, three integrity points, both routes, objectives/checkpoints and original art/audio. Free post-gate Toolkit/Cloak selection replaces market gates for this action-only edition. Accessible extraction retains no speed timer and remains subject to teacher control. Full team cipher/narrative gameplay is not part of this mini-game adapter. Server state is authoritative; settings apply at the next gate and refresh resumes the same round paused.

## alpha.3 Nightfall integration

See [city mission scope](change-specs/v0.1.0-alpha.3.md). Import Last Bus Out with no short countdown, its historic 7,200-second review envelope, optional store rescue, shotgun, alarms, garage horde and accessible objectives. Zero to three post-gate resources and source threat presets are free Arcade preparation choices. Exact simulation state survives reload/restart; accessible completion is separate from action success. First Response and the team narrative remain outside this mini-game adapter.

## Current continuation

Math Civ is integrated in the v0.2.1 candidate. See [checkpoint and verification limits](checkpoints/v0.2.1.md). Journey remains excluded. Complete hosted candidate verification, establish a successful upstream-sync run, deploy the backend, then perform physical-device and school-network checks. Historical intake notes above describe earlier checkpoints.

## Deployment continuation — 8 October 2026

Owner permits proceeding on assumed iPad/network compatibility only if architecture matches MathQuest. Inspection found Arcade's Node/SQLite server differs from MathQuest's Worker/Durable Object/relay architecture. Hosting direction is unresolved; see [source comparison and proposed choices](change-specs/deployment-architecture-2026-10-08.md). No migration/deployment or physical-test pass is claimed. Current handbook consulted at `fd4330863f4cc0812180fbf1de122970a42c7885`.

## Approved Cloudflare migration — 8 October 2026

Owner approved the recommended migration with “Yes”. The previous unresolved hosting choice above is superseded. Target v0.3.0-rc.1 uses a separate `math-arcade` Worker with SQLite-backed `ArcadeWorkspace` Durable Object. The same-origin frontend/API use Worker Static Assets to preserve existing HttpOnly cookies; this shares MathQuest's backend infrastructure family but does not duplicate its GitHub Pages/Netlify relay network route. Physical iPad and school-network checks remain Not run, deferred under the owner's direction; no verified-device or school-network claim is made.

Implementation baseline: `5e627cc3b25f903a4d594e1077af9bef7c1284a2`; handbook `fd4330863f4cc0812180fbf1de122970a42c7885`. See [migration contract](change-specs/v0.3.0.md). Canonical source sync now has successful hosted evidence: run 37732838790. No existing MathQuest namespace or room is changed. Cloudflare account access and applicable service quotas are required; no paid upgrade is provisioned or assumed.

## Verified Worker candidate — 8 October 2026

Cloudflare migration candidate `900198428f94be221e61e76eb330d87f09ebe908` passed the complete repository build, 41 Node tests, seven Chromium suites, Wrangler packaging and the real workerd regression in [run 37734366972](https://github.com/williammcada/Math-Arcade/actions/runs/37734366972). The exact Worker/assets package is preserved, with evidence and limitations in [v0.3.0 checkpoint](checkpoints/v0.3.0.md). Earlier failed migration checkpoint notifications are resolved by this successful run. Deployment remains pending: no authenticated Cloudflare account was available. Physical iPad and school-network checks remain Not run, deferred as instructed. No live readiness claim or paid upgrade.
