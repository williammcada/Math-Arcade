# Next integration — Journey to the West source intake

Source inspected 2026-10-01: `williammcada/Math-Quest---Vault-7-`, branch `recovery/journey-stage1-20261001`, commit `316189b94dd2e0d73fd1dc605242ef40bb5167ff`. Main contains no Journey implementation. The design and old implementation branches remain on the design checkpoint, so use the recovery branch explicitly.

Read recovery record, stage-1 verification, config, combat model, session server, Durable Object transport, browser host and controller. Upstream recovery record identifies the recovered original implementation as `421e7da2f2d667c24c83d4af9d30330c6c200e99`; its recovery branch is the current published source, not a deployed multiplayer claim.

## Existing prototype

Five-person cooperative combat sample; individual hero reservation; readiness/all-ready early start or 60-second deadline subset; three-second launch, 180-second active play; automatic respawn within three lives; earned personal upgrades; server-authoritative combat, reconnect/dropout and teacher pause/end. Wukong and raider atlases exist; four other heroes use labeled markers. Raiders, crates and pickups form the sample arena. Full progression, Nezha, remaining animation kits, exact special choreography, soundtrack and narrative content are unfinished.

The inspected source has a separate input controller that predates the current shared held-input implementation. Reconcile it to the pinned shared engine before enabling Arcade play. Passing old tests does not establish current U-10/device compliance.

## Arcade bridge to implement and verify

Use one personal shared-math gate per participant before joining a new round. Remove optional preparation mathematics from this host; specify post-gate equipment acquisition explicitly without creating more gates. Preserve automatic in-round respawn. Define a roster/team selection model for Arcade, then bind each authenticated student to a single room and hero; gate credit cannot transfer across students. Freeze gear and room membership at launch. Preserve the experimental sample identity and its historical 180-second timing until deliberately revised.

Adapt the existing combat model, not the whole MathQuest campaign. Specify shared persistence, readiness, teacher control and authoritative transport separately from the current individual round dispatch. Test two then five clients, all-ready/deadline/zero-ready cases, stale controller/input, dropout/reconnect, pause/end, restart, expiry/deletion and round replay. Record exact prototype limitations in the student catalog before enabling it. Keep academic evidence separate from combat participation.

No Journey files are imported or enabled by this intake. The completed Arcade checkpoint remains alpha.3 with Coastal Escape, Vault 7 and Nightfall. No upstream branch is changed. Preserve staged implementation and verification checkpoints before larger multiplayer/full-level work.
