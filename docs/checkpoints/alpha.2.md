# Math Arcade alpha.2 — second game: Vault 7

Baseline: GitHub `d3040d129ac54c0d4371d4313de5ddcec74f5b55`. Local pre-verification implementation checkpoint: `82819be` (connector publication has a separate Git identity). Scope: [alpha.2 change specification](../change-specs/v0.1.0-alpha.2.md).

Two games are now enabled: Coastal Escape and Vault 7. Six integrations remain. Nightfall is the next planned game; Journey to the West, robot shooter, Chrono Circuit, Olivia and Math Civ follow. The existing native-gate and no-added-gate requirements remain unchanged.

Vault 7 uses the original three-minute stealth extraction, both routes, three integrity points, checkpoint recovery, Toolkit/Cloak, sprite, hardware rendering and finale music. Route and free equipment choices happen after the math gate and are immutable after launch. This is the individual action reward, not the full MathQuest cipher campaign. The source's Scanner has no action effect and is not offered here.

The server simulates and saves exact round state. Client prediction is visual only. Start retries cannot change route, time or loadout. Teacher game availability blocks new rounds independently for each game; existing rounds retain pause/end controls. Reload and server restart recover paused. Terminal extraction, capture, timeout or leaving requires new assigned math to replay. No mid-round gate is added.

Accessible extraction reuses the three original decision scenes. It retains checkpoint credit, detections, Toolkit sensor bypass, one-use Cloak and held final boarding. Its no-speed-timer behavior is preserved, with teacher session control replacing the source team's separate classroom deadline. It is a separate outcome, not evidence of mathematics mastery. Neither game has a full historical game-results dashboard; the retained active/most-recent round is replaced when the next round begins. Mathematics history remains separate and persistent.

Verification details: [current record](../VERIFICATION.md). Local testing does not establish physical iPad/iPhone behavior, school-network/classroom concurrency, hosting, or deployment readiness. No Render service was provisioned.
