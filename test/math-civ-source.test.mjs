import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCiv} from '../scripts/build-civ.mjs';
test('Math Civ classroom build preserves pinned source and exposes the classroom adapter',()=>{
 const root=new URL('../',import.meta.url).pathname.replace(/\/$/,'');
 const manifest=JSON.parse(readFileSync(root+'/vendor/manifest.json'));
 const entry=manifest.files.find(f=>f.dest.startsWith('vendor/math-civ/'));
 const bytes=readFileSync(root+'/'+entry.dest);
 assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),entry.sha);
 buildCiv(root);
 const html=readFileSync(root+'/build/math-civ/index.html','utf8');
 assert.match(html,/src="\.\/campaign-runtime.js"/);assert.doesNotMatch(html,/<script(?! type="module" src=)/);
 const code=readFileSync(root+'/build/math-civ/game.js','utf8');
 assert.match(code,/installArcadeCiv\(window.arcadeCiv\)/);assert.match(code,/if\(!window.arcadePaused\)this.dispatch/);
 assert.doesNotMatch(code,/window.arcadeGate\(/);
 assert.match(code,/Your task/);assert.match(code,/BUILT-IN MATH · CLASSROOM EDITION/);
});
