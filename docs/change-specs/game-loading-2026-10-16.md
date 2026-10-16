# Faster game loading (Math Arcade and upstream games)

**Status:** Approved by William McAda, 2026-10-16 (Asia/Shanghai). Phase 1 released as MathQuest 0.14.2 (merged `6d185cb`, 16 October). Phase 4 in Math Arcade v0.10.2 ([spec](v0.10.2-early-art.md)). Phases 2–3 not started.
**Trigger:** Owner report that Journey to the West loads slowly in Math Arcade; a student suggested preloading.
**Sources read:** Math-Arcade `adab5cc` (main has since moved to `316864a`; re-check at implementation) (main, 2026-10-16); mathquest `5a5d7c6` (the commit Arcade pins for Journey, Nightfall, Blackline, Kingsgate, Blackout, Coastal, Vault 7); CHRONO-CIRCUIT `cfc8ff6`; Math-Civ `4a91e8e` (pinned files in `vendor/`).
**Handbook baseline:** mcada-project-handbook `9d9c80f` (AI-START-HERE, UNIVERSAL-RULES, CONDITIONAL-STANDARDS, RELEASE-CHECKLIST).

## What is slow, and why

1. **Art starts downloading too late.** In Arcade the student picks a game, answers the gate, picks a hero or loadout, then presses Start. The game host is only created at Start, and `adapter.loadArt()` runs there (`public/extra-games.js`, `flight.js`, `nightfall.js`, `vault.js`, `kingsgate-game.js`). Nothing downloads during the gate or the preparation screen.
2. **Some art is far heavier than it needs to be.** Journey waits for every image to decode before drawing.

Art each game downloads when a round starts (measured from the pinned files):

| Game | Art loaded at round start | Format | After WebP (quality 90, measured) |
| --- | --- | --- | --- |
| Journey to the West | 20 sprite sheets, 43.5 MB, plus 4 backgrounds 1.3 MB | PNG, 1536×1024 | **8.4 MB** sprites (≈9.7 MB total) |
| Nightfall 1 / False Haven | 7 sheets, 7.5 MB | PNG | **2.0 MB**; 0.5 MB for the four shared sheets if also stored at the 512×512 size the renderer already shrinks them to |
| Chrono Circuit (campaign) | 6 images, 4.4 MB | PNG | **0.6 MB** |
| Math Civ (campaign) | one 13.3 MB HTML file; 8.05 MB of it is 20 embedded WAV sounds | WAV inside HTML | estimate 3–4 MB if the sounds become MP3 (not measured) |
| Coastal, Vault 7, Blackline, Olivia | 0.6–2.8 MB | already WebP | no change |
| Kingsgate, Blackout, Ironbreak | under 2.5 MB, mostly WAV sound | SVG / drawn in code | low priority |

The student's instinct is right but the order matters: with a class of 25 starting Journey together, today's file sizes mean over a gigabyte on school Wi-Fi whether it is preloaded or not. Shrinking files comes first; early loading then hides what remains.

## Not the problem

- Game code. Arcade's home page already loads every game's JavaScript; it is small next to the art.
- Cover images. Twelve covers, 23–67 KB each, lazy-loaded.
- Nightfall's four story illustrations (9.5 MB PNG) are in the build but no Arcade page requests them.

## Plan

Each phase is a separate revision in the repository that owns the files, with its own version and the usual DESIGN → CHANGE SPEC → IMPLEMENT → CHECKPOINT → VERIFY → VERIFIED CHECKPOINT → RELEASE → DEPLOY. Arcade picks up upstream changes through its source sync.

### Phase 0 — Baseline (no code)

On the live site (`https://mcada-matharcade.onrender.com/`) with Chrome DevTools, Network tab, cache disabled: launch Journey, Nightfall, False Haven, Chrono and Math Civ once each. Record megabytes transferred and seconds until the game draws. Repeat once with cache enabled and note whether art comes back as `304`/from cache or downloads again. If possible, time Journey on one student iPad on school Wi-Fi. These numbers are the "before" for every later phase.

### Phase 1 — MathQuest: convert Journey and Nightfall art to WebP

Repository: `williammcada/mathquest`. Also speeds up MathQuest itself.

- Convert the 20 Journey sprite sheets to WebP at quality 90, same pixel size; update file names in `public/games/journey/` (hero, enemy, item and repair tables). Same pixel size means frame coordinates and bounds data do not change.
- Convert Nightfall `city/` and `shared/` sheets and the False Haven PNGs to WebP; store the shared sheets at the 512×512 size `renderer.js` already resizes them to.
- Keep the PNG originals out of the served folder (source folder or OneDrive), so the build ships only what the game uses.
- Asset provenance notes record that these are format conversions of the same art; the maker does not change (U-15).
- Version bump in every changed HTML file (U-01).

Verify: side-by-side screenshots of each hero, enemy, item and background, PNG vs WebP, approved by the owner as visually unchanged (U-06); each level of Journey and one Nightfall and False Haven round played through; transfer size measured again.

### Phase 2 — Chrono Circuit: convert its six PNGs to WebP

Repository: `williammcada/CHRONO-CIRCUIT`. Same method and checks as Phase 1. Small but nearly free.

### Phase 3 — Math Civ: compress embedded sound

Repository: `williammcada/Math-Civ`. Re-encode the 20 embedded WAV sounds as MP3 in the build that produces the single HTML file. Keep the file single and offline-capable. Verify every sound still plays on an iPad (Safari) and that the file opens offline as before.

### Phase 4 — Math Arcade: start loading art at the gate

Repository: `williammcada/Math-Arcade`; next Arcade version after 0.10.0.

- Add one shared art cache: the first call to a game's `loadArt()` stores its promise; later calls reuse it.
- When the student state shows a gate for a chosen game (`s.gate` with `s.activity.game`; the server records the game when it is chosen, but confirm the student state carries it during the gate), start that game's `loadArt()` in the background. Only the chosen game loads, so no bandwidth goes to games the student did not pick.
- The game host's existing `loadArt()` call then receives the stored result, ready or nearly ready, when the student presses Start. A failed load is not cached, so the host's current error and retry behaviour stays as it is.
- Applies to every gate-first game (Journey, Nightfall, False Haven, Blackline, Blackout, Coastal, Vault 7, Ironbreak, Kingsgate). Campaign games (Chrono, Olivia, Math Civ) open in their own frame without an Arcade gate and are covered by Phases 2–3 only.
- Sync the new upstream pins from Phases 1–3.
- Caching: if Phase 0 shows art downloading again on every round, set a cache lifetime for game art in `server/worker.mjs` (the Node server already gives Coastal art one hour), and confirm the Render relay passes it through.

Verify: automated test that a gate triggers exactly one art load for the chosen game and none for others; DEV playtest (U-13) still skips gates and loads art at launch; slow-network run in Chromium (DevTools throttling) showing art finished before Start; the full student flow on the live site after deploy, and on a school iPad when possible (U-07, S-04).

### Phase 5 — Only if still needed

- Journey sprites at half resolution: measured 3.1 MB instead of 8.4 MB, but every frame coordinate and bounds table must be scaled with it. Higher risk; decide after Phase 4 numbers.
- WAV to MP3 for Kingsgate, Blackout, Blackline and Nightfall effects (about 6 MB in total), after checking when each sound loads.

## Expected result

Journey launch drops from about 45 MB to about 10 MB, mostly downloaded while the student answers the gate. Nightfall drops from 7.5 MB to about 1–2 MB. Exact timings come from Phase 0 and the after-measurements, not from this estimate.

## Must retain

Same art appearance, same frames and animation, same sound; existing load-failure messages and retry; DEV mode; single-file offline Math Civ; native MathQuest behaviour other than smaller files.

## Owner decisions (2026-10-16)

1. WebP at quality 90, same pixel size, subject to owner approval of side-by-side screenshots (original vs converted) before release. Lossless is the fallback if any image looks different.
2. Order: Phase 1 (MathQuest) and Phase 4 (Arcade early loading) first. Phases 2 (Chrono Circuit) and 3 (Math Civ) follow as separate small revisions. Phase 5 only if still needed.
3. PNG originals move to a source folder in the MathQuest repository that is not deployed, so they stay in the project history and can be re-converted.
