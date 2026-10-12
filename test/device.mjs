// Test double for a student device under the v0.4.1 contract: the device runs
// the round locally from the last server-accepted state and reports a snapshot.
import * as rounds from '../server/rounds.mjs';
export function device() {
  let fraction = 0, held = {};
  return {
    // Play `ms` of local time with `keys` and return the snapshot to send, or
    // undefined when the device would be blocked (paused, teacher pause, ended).
    play(view, ms, keys = {}) {
      const r = view.activity?.round;
      // Keys sent now are held for the following interval, as on a real device.
      const previous = held; held = keys;
      if (!r?.running || view.status !== 'open' || r.snapshot.outcome || r.snapshot.arcadeMode === 'accessible') { fraction = 0; return undefined; }
      const game = view.activity.game, sim = structuredClone(r.snapshot), input = Object.fromEntries(rounds.keysFor(game).map(k => [k, previous[k] === true]));
      const frames = ms * 60 / 1000 + fraction, steps = Math.floor(frames);
      fraction = frames - steps;
      for (let i = 0; i < steps && !sim.outcome; i++) rounds.step(game, sim, input, 1 / 60);
      return rounds.snapshot(game, sim);
    }
  };
}
