# Math Arcade alpha.3 — third game: Nightfall

GitHub baseline `c947c1c9254bde26ad73037319a3c1f4a51ebf0c`. Pre-verification local implementation checkpoint `83ea0a4`. Connector publication uses a separate commit identity and compares exact file-tree hashes. [Scope](../change-specs/v0.1.0-alpha.3.md); [verification](../VERIFICATION.md).

Coastal Escape, Vault 7 and Nightfall are integrated. Five remain. Next: identify and integrate Journey to the West; robot shooter, Chrono Circuit, Olivia and Math Civ follow. Their native-gate and no-added-gate policies remain unchanged.

Nightfall imports Last Bus Out's existing city mission, source art/audio, tank controls, six repair/escape objectives, optional store rescue, shotgun, alarms, breakable windows, doors, fuel hazards and garage horde. Post-gate threat and three free equipment choices freeze at launch. No additional questions interrupt a round. Preserve no short countdown and the existing 7,200-second active review envelope; this is a historic timing exception. First Response and the team campaign are outside this adapter.

Server simulation and commands own all outcomes and exact saved state. Client prediction is presentation only. Reconnect/restart returns paused without refreshing gear, enemies, alarms or objectives. Accessible mode uses the original covered/risky approaches and optional store sequence, retains resources, and cannot switch back to action. Accessible success is distinct from action success and math evidence.

Teacher availability blocks new rounds; pause/end controls existing rounds. The active/most-recent round is retained until another round starts. Full game-result history/reporting is not yet implemented; persistent math history stays separate.

No hosted deployment or physical device/classroom-network verification. This is a locally tested source checkpoint, not a classroom-ready release.
