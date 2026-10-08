import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {catalog,Practice,freshMath,formatItem,keypadKeys} from '../build/math/shared-math/engine.js';
test('canonical Math Engine supplies legacy assignments, geometry rendering and remainder entry',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../vendor/manifest.json',import.meta.url)));
 assert.equal(manifest.math.repo,'williammcada/MATH-ENGINE');
 assert.ok(catalog.length>=312);
 for(const id of ['S01','g6-lcm','g3-mul','g4-remainder'])assert.ok(catalog.some(s=>s.id===id),id);
 const geometry=catalog.find(s=>s.make().diagram);assert.ok(geometry);
 const state=freshMath(geometry.id);state.config.count=1;const practice=new Practice(state);practice.open('coastal','geometry-contract');
 assert.match(formatItem(state.gate.item),/<svg/);assert.equal(practice.submit(String(state.gate.item.answer)).complete,true);
 assert.ok(keypadKeys('remainder').includes('R'));
 const file=manifest.files.find(f=>f.dest==='vendor/math/shared-math.js'),bytes=readFileSync(new URL('../'+file.dest,import.meta.url));assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),file.sha);
});
