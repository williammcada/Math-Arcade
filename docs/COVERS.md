# Card art (`public/covers/`)

Each game card on the student page shows one 16:9 image. Images are small copies made for the card (640×360 WebP, quality 80, centre crop; ~35–65 KB each) so the game list stays light on Render's monthly bandwidth. Kingsgate and Blackout use their code-drawn SVG covers unchanged. Covers live in Math Arcade itself because Chrono, Olivia and Math Civ files are only served to a student inside that adventure.

| File | Source (game repository and file) | Made by |
| --- | --- | --- |
| `false-haven.webp` | mathquest `public/assets/false-haven/cover-v3.webp` | painted (ChatGPT) |
| `journey.webp` | mathquest `public/assets/journey/cast-concept.png` (crop below its label) | painted (ChatGPT) |
| `blackline.webp` | mathquest `public/assets/blackline/cover.webp` | painted (ChatGPT) |
| `kingsgate.svg` | mathquest `public/assets/kingsgate/cover.svg` (unchanged) | polygon, Claude (U-15) |
| `blackout.svg` | mathquest `public/assets/blackout/cover.svg` (unchanged) | polygon, Claude (U-15) |
| `coastal.webp` | mathquest `public/assets/coastal-escape/cover.webp` | painted (ChatGPT) |
| `vault7.webp` | mathquest `public/assets/vault7/scenes/cover.webp` | painted (ChatGPT) |
| `nightfall.webp` | mathquest `public/assets/nightfall/cover.png` | painted (ChatGPT) |
| `robot.webp` (Ironbreak) | mathquest `public/assets/ironbreak/cover.webp` | painted (ChatGPT) |
| `chrono.webp` | CHRONO-CIRCUIT `public/assets/title.png` | as in source repository |
| `olivia.webp` | OLIVIA-MAGIC-BRACELET-QUEST `public/art/cover.webp` | as in source repository |
| `math-civ.webp` | Math-Civ `PLAY-SEKIGAHARA-0.3.1.html`, embedded `./art/BG_TITLE.webp` (title screen), extracted 14 Oct 2026 | painted pixel art (as in source) |

Sources were taken from mathquest `86e6b3f` (v0.12.0 candidate) and each other repository's `main` on 14 October 2026. When a game's cover changes, regenerate its card image the same way and update this table. A game without a file here shows its number on a plain card.
