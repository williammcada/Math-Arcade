// Math Arcade v0.4.1 — device-run action rounds (the MathQuest model).
// The student's device simulates the round. Server replies update round status,
// teacher pause/end and outcomes, but never overwrite a round that is running
// locally. The device sends its own snapshot so reloads resume where play was.
export const SNAPSHOT_EVERY_MS = 500;

// Snapshot to attach to an outgoing request, or undefined when none is due.
// Always sent with an action (pause/resume/command) and once an outcome exists.
export function outgoing(host, action) {
  if (!host.round?.running || !host.sim || host.sim.arcadeMode === 'accessible') return undefined;
  const now = performance.now();
  if (!action && !host.sim.outcome && now - (host.sentAt || 0) < SNAPSHOT_EVERY_MS) return undefined;
  host.sentAt = now;
  return {...host.sim, events: []};
}

// True when a heartbeat reply confirms the same round is still running, so the
// local simulation must be kept instead of replaced by the server's copy.
// Accessible/guided modes stay server-stepped, so their replies are adopted.
export function keepLocal(host, next, action) {
  const before = host.round, after = next?.activity?.round;
  return !!(before?.running && after && after.id === before.id && after.running &&
    next.status === 'open' && !after.snapshot?.outcome && after.snapshot?.arcadeMode !== 'accessible' &&
    host.sim?.arcadeMode !== 'accessible' && !action && !host.commanding);
}
