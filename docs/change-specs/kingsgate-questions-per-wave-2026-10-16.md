# Kingsgate questions per wave (Math Arcade)

**Status:** Owner instruction 2026-10-16; implemented on `implement/kingsgate-questions-per-wave` from `main` `a77b8a5`.

**Owner decision:** Kingsgate in Math Arcade needs its own sub-setting, one question per wave by default; using "questions per gate" (often 3) for every one of the 11 question rounds is overwhelming. MathQuest is unaffected: its students answer the cartridge gates before the defense.

**Change**
- New math setting `kgPerWave`, 1–5, default 1, in the class default and individual assignments ("Kingsgate: questions per wave" in the math editor; the class summary shows it).
- Kingsgate question rounds use `kgPerWave`. "Questions per gate" no longer affects Kingsgate rounds; it still applies to every other game's gate and to the gate owed after leaving Kingsgate early.
- Saved settings without the field get 1.
- Gold per correct answer stays 30. Earlier balance runs held the gate with 30 gold per round and lost with 0, so one question per wave keeps the game winnable and still rewards answering.

**Verification:** `test/kingsgate.test.mjs` (default 1; independent of gate count; 2 and 5 honored; 0 and 6 rejected; other games keep the gate count); `test/kingsgate-browser.cjs` (two-question round); teacher editor checked in Chromium (field defaults to 1, saves 2, summary shows "Kingsgate 2 per wave").
