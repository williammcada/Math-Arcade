// Math Arcade v0.10.1: teacher preview "Next variant" (same seed, next Engine index).
import test from 'node:test';
import assert from 'node:assert/strict';
import {Model} from '../server/model.mjs';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';

test('v0.10.1: preview variants are deterministic, distinct, and variant 0 is the original sample',()=>{
 const dir=mkdtempSync(tmpdir()+'/arcade-variant-');const m=new Model(dir+'/db.sqlite','test-password-only');
 try{const t=m.tx(s=>m.login(s,'test-password-only'));const pv=(ids,v)=>m.tx(s=>m.preview(s,t,ids,v));
  const ids=['g3-reduce','bank:algebra-1-en:node:570','bank:course-87-en:item:SN870001'];
  assert.deepEqual(pv(ids),pv(ids,0));
  for(const id of ids){const seen=new Set();
   for(let v=0;v<8;v++){const [a]=pv([id],v),[b]=pv([id],v);assert.equal(a.variant,v);assert.deepEqual(a,b);seen.add(a.html+'|'+a.answer);}
   assert.ok(seen.size>=4,`${id}: only ${seen.size} distinct variants`);}
  assert.equal(pv(['g3-reduce'],-2)[0].variant,0);assert.equal(pv(['g3-reduce'],'7')[0].variant,0);assert.equal(pv(['g3-reduce'],1e9)[0].variant,9999);
 }finally{m.close();rmSync(dir,{recursive:true,force:true});}
});
