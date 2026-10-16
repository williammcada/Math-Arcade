// Math Arcade v0.10.2: the chosen game's art starts downloading during its math gate,
// and the game host reuses that same download (game-loading spec, Phase 4).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerArt, artFor, preloadArt, artStarted} from '../public/art-preload.js';

test('v0.10.2: preloading starts one load, and the host receives the same result', async () => {
  let calls = 0;
  registerArt('t-one', async () => { calls++; return {sheet: 'loaded'}; });
  assert.equal(artStarted('t-one'), false);
  preloadArt('t-one');
  assert.equal(artStarted('t-one'), true);
  const [a, b] = await Promise.all([artFor('t-one'), artFor('t-one')]);
  assert.equal(calls, 1);
  assert.equal(a, b);
  assert.deepEqual(a, {sheet: 'loaded'});
});

test('v0.10.2: only the chosen game loads', () => {
  let other = 0;
  registerArt('t-chosen', async () => ({}));
  registerArt('t-other', async () => { other++; return {}; });
  preloadArt('t-chosen');
  assert.equal(artStarted('t-other'), false);
  assert.equal(other, 0);
});

test('v0.10.2: a failed load is forgotten so the host can retry', async () => {
  let calls = 0;
  registerArt('t-fail', async () => { calls++; if (calls === 1) throw new Error('offline'); return {ok: true}; });
  preloadArt('t-fail');
  await assert.rejects(artFor('t-fail'), /offline/);
  await new Promise(r => setTimeout(r, 0));
  assert.equal(artStarted('t-fail'), false);
  assert.deepEqual(await artFor('t-fail'), {ok: true});
  assert.equal(calls, 2);
});

test('v0.10.2: unknown games and games without art do nothing', () => {
  assert.equal(artFor('t-unknown'), null);
  assert.doesNotThrow(() => preloadArt('t-unknown'));
  assert.doesNotThrow(() => preloadArt(undefined));
});

test('v0.10.2: every art-loading game host goes through the shared cache', () => {
  const read = f => readFileSync(new URL('../public/' + f, import.meta.url), 'utf8');
  for (const [file, game] of [['nightfall.js', 'nightfall'], ['flight.js', 'coastal'], ['kingsgate-game.js', 'kingsgate']]) {
    const s = read(file);
    assert.match(s, new RegExp(`registerArt\\('${game}'`), file);
    assert.match(s, new RegExp(`artFor\\('${game}'`), file);
    assert.doesNotMatch(s, /[^,(]\s*(this\.)?adapter\.loadArt\(\)\.then/, file);
  }
  const extra = read('extra-games.js');
  assert.match(extra, /registerArt\(game,/);
  assert.match(extra, /artFor\(this\.game,/);
  assert.match(read('app.js'), /preloadArt\(s\.activity\.game\)/);
});
