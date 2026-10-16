import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {catalog,courses,Practice,freshMath,configError,generate,version,contentHash} from '../build/math/engine.js';
import {Model} from '../server/model.mjs';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';

const manifest=JSON.parse(readFileSync(new URL('../vendor/manifest.json',import.meta.url)));

test('canonical Math Engine bundle is pinned, hash-verified and K–Algebra 2',()=>{
 assert.equal(manifest.math.repo,'williammcada/MATH-ENGINE');
 assert.match(manifest.math.commit,/^[0-9a-f]{40}$/);
 const prov=JSON.parse(readFileSync(new URL('../vendor/math/math-engine-practice.provenance.json',import.meta.url)));
 for(const f of manifest.files.filter(f=>f.dest.startsWith('vendor/math/'))){const bytes=readFileSync(new URL('../'+f.dest,import.meta.url));assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),f.sha,f.dest);}
 assert.equal(createHash('sha256').update(readFileSync(new URL('../build/math/engine.js',import.meta.url))).digest('hex'),prov.bundleSha256);
 assert.equal(version,prov.engineVersion);assert.equal(contentHash,prov.contentHash);
 const layers={};for(const e of catalog)layers[e.layer]=(layers[e.layer]||0)+1;
 assert.equal(layers.skill,312);assert.equal(layers.bank,1158);/* v0.11.0: Engine 0.37.0 keeps multi-answer questions out of games (was 1,441). */assert.equal(catalog.length,prov.catalog.total);
 assert.deepEqual(courses.map(c=>c.course),['Intermediate 4','Course 1','Introduction to PreAlgebra (8/7)','Algebra 1/2','Algebra 1','Algebra 2']);
});

test('existing K–7 assignments, geometry rendering and remainder entry still work',()=>{
 for(const id of ['S01','g6-lcm','g3-mul','g4-remainder'])assert.ok(catalog.some(s=>s.id===id),id);
 const geometry=catalog.find(s=>s.layer==='skill'&&generate(s.id,{seed:'g'}).diagram);assert.ok(geometry);
 const state=freshMath(geometry.id);state.config.count=1;const practice=new Practice(state);practice.open('coastal','geometry-contract');
 assert.match(state.gate.item.html,/<svg/);assert.equal(practice.submit(state.gate.item.answerText).complete,true);
 const remainder=catalog.filter(s=>s.layer==='skill').map(s=>generate(s.id,{seed:2})).find(q=>q.type==='remainder');assert.ok(remainder&&remainder.keys.includes('R'),'a remainder skill offers the R key');
});

test('targeted gates serve course-bank and extra items from Grade 3 to Algebra 2',()=>{
 const ids=['bank:intermediate-4-en:authored:M2-4078157a9e82-2','bank:algebra-2-en:node:209','mq-properties','k-next'];/* node:142 ("Enter x; y") left games in Engine 0.37.0 */
 const state=freshMath('S01');state.config={...state.config,mode:'targeted',lo:0,hi:0,selected:ids,count:8};
 assert.equal(configError(state.config),'');
 const practice=new Practice(state);practice.open('vault','engine-span');const seen=new Set();
 for(let i=0;i<8&&state.gate;i++){const item=state.gate.item;seen.add(item.skillId);assert.equal(practice.submit('definitely wrong').correct,false);assert.equal(practice.submit(item.answerText).correct,true);}
 assert.equal(state.gate,null);assert.ok(seen.size>=3,[...seen].join());
});

test('teacher catalog is served once by /api/catalog; polls carry only its hash; preview uses the engine',()=>{
 const dir=mkdtempSync(tmpdir()+'/arcade-engine-');const m=new Model(dir+'/db.sqlite','test-password-only');
 try{const t=m.tx(s=>m.login(s,'test-password-only'));const tx=f=>m.tx(f);
 const view=tx(s=>m.teacherView(s,t));assert.equal(view.catalog,undefined);assert.equal(view.catalogHash,contentHash);assert.equal(view.engine.version,version);
 const cat=tx(s=>m.catalogView(s,t));assert.equal(cat.catalog.length,catalog.length);assert.ok(cat.catalog.every(r=>r.id&&r.name&&r.layer));
 const preview=tx(s=>m.preview(s,t,['k-next','bank:algebra-2-en:node:209']));assert.equal(preview.length,2);assert.ok(preview.every(q=>q.html&&q.answer));
 }finally{m.close();rmSync(dir,{recursive:true,force:true});}
});
