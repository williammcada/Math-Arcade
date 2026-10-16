// Math Arcade v0.11.1 (game-loading spec, Phase 4): start a game's artwork while the
// student answers its math gate, so the round can start as soon as they press Start.
// One download per game per page. The game host later receives the same result.
// A failed load is forgotten, so the host's own error message and retry still work.
const loaders = new Map(), pending = new Map();

export function registerArt(game, load) { loaders.set(game, load); }

export function artFor(game, load = loaders.get(game)) {
  if (!load) return null;
  let promise = pending.get(game);
  if (!promise) {
    promise = Promise.resolve().then(load);
    pending.set(game, promise);
    promise.catch(() => { if (pending.get(game) === promise) pending.delete(game); });
  }
  return promise;
}

export function preloadArt(game) { artFor(game)?.catch(() => {}); }

export function artStarted(game) { return pending.has(game); }
