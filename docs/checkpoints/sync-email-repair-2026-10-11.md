# Canonical-sync notification repair — 11 October 2026

Owner request: diagnose and fix the recurring failure emails identified in “Github Email Failures”. Baseline: `0858778ebae086aba77216ffe62707f4ed9636d9` (runtime v0.4.0-rc.1).

## Evidence

Runs 38083941060, 38056002087 and 38045074260 download canonical sources and pass build, static checks, Node tests and Worker packaging. They fail in test/ironbreak-browser.cjs: “Input must reach server within the command lease”. Source promotion is skipped. Six subsequent scheduled runs passed unchanged. Diagnostic run 38108045262 passed nine Ironbreak executions plus the full suite. This is intermittent, not a consistently broken source import or credentials failure.

The historical logs do not record whether the round was paused, so the exact interruption behind those historical assertions cannot be proven retrospectively. Source inspection identifies a relevant ambiguity: Ironbreak deliberately pauses and clears held controls after a frame gap above 200 ms, while the old test reports neutral input as transport failure. The repair explicitly distinguishes and verifies this safety behavior instead of relaxing the lease assertion or retrying arbitrary failures.

## Repair

- Hourly and repository-dispatch syncs still fetch canonical sources. If the complete vendor working tree is unchanged, skip redundant installation/build/browser checks and promotion. Manual workflow_dispatch retains the full verification path even without changes.
- Every changed snapshot, including manifest-only changes, must still pass the complete existing suite before promotion. Fetch failures remain failures. Notification settings and the hourly schedule remain unchanged.
- Ironbreak input verification records frame gaps and interruption events. Only a paused, active round with a recorded slow frame, the expected pause overlay, and no blur/resize/context-menu event can trigger bounded recovery (three attempts maximum). Verify neutral controls and no automatic resume; explicitly resume and require fresh input before repeating the complete two-touch release scenario. Running-round failures and other interruptions still fail.
- A deliberate 350 ms renderer stall exercises this path on every Ironbreak browser-test run. Both ordinary touch release orders and all existing cancellation, pause, rotation, reload and completion checks remain.

## Checkpoint and verification

Implementation checkpoint; final hosted CI and merge evidence will be recorded in [PR #1](https://github.com/williammcada/Math-Arcade/pull/1). Do not interpret the diagnostic green runs as verification of the later repair.

Local checks passed: JavaScript syntax; workflow YAML parsing and verification/promotion conditions; source-change detection with unchanged, modified, added and deleted files. Local browser execution was unavailable because the browser binary download did not produce a valid archive. Browser verification therefore uses GitHub-hosted Chromium.

No application, generated HTML, canonical game implementation or saved data is modified. Runtime version stays unchanged. No application deployment is required for a workflow/test-only repair. Physical iPad and school-network verification are not performed or implied.

Handbook consulted: fd4330863f4cc0812180fbf1de122970a42c7885 — AI-START-HERE.md, UNIVERSAL-RULES.md, CONDITIONAL-STANDARDS.md (project-selected S-02/S-03/S-04) and RELEASE-CHECKLIST.md; Math Arcade PROJECT-BRIEF.md and approved v0.4.0 change specification. No handbook changes.
