# Source provenance

Shared mathematics is imported from William McAda's OLIVIA-MAGIC-BRACELET-QUEST repository at `df28efce7bde25a239915af7db72b8b5caf85eb4`. Coastal Escape code, artwork, audio and held-input utilities are imported from William McAda's Math-Quest---Vault-7- at `02acd2cdf065adf33df4a2dd90094ef4381ce39a`. Exact paths and Git blob hashes are in vendor/manifest.json. No source game or canonical shared math file is edited by the Arcade adapter.

public/qrcode.js is the existing bundled QRCode for JavaScript implementation from the same MathQuest source revision. It retains its header credit: Copyright (c) 2009 Kazuhiko Arase, MIT License. Keep upstream attribution and asset provenance when redistributing. This checkpoint does not change source asset ownership or grant a new license for the entire application.

Vault 7 imports six files from MathQuest `59c11c90c2f0893333dfe30b62578fd73deb9bbf`. See vendor/manifest.json for exact original paths and hashes. Original drawing and accessible-scene code is extracted reproducibly during build. Regression tests in test/vault-source.test.mjs and test/shared-input.mjs are adapted from that revision (module paths and excluded legacy client-recovery test identified in the files).
