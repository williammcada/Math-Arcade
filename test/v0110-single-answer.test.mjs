// v0.11.0: Math Engine 0.37.0 keeps multi-answer questions out of games; saved selections are cleaned on start.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {catalog,find,gameExclusion,generate,configError,freshMath,Practice,version} from '../build/math/engine.js';
import {Model} from '../server/model.mjs';

const REMOVED='bank:course-87-en:authored:MCADA-30.1'; // "Rename 1/3 and 1/2 … Enter first numerator; second numerator; common denominator"
const REMOVED2='bank:algebra-2-en:node:142';           // system of equations, "Enter x; y"
const KEPT='bank:algebra-2-en:node:209', K7='k-next';
const PW='test-password-only';

test('Engine 0.37.0 and later: no game question asks for more than one answer',()=>{
 assert.equal(version,'0.63.0');
 assert.equal(find(REMOVED),null);assert.equal(gameExclusion(REMOVED),'multi-part');assert.equal(gameExclusion(REMOVED2),'multi-part');
 assert.ok(find('bank:course-87-en:authored:MCADA-30.3'),'single-answer sibling kept');
 assert.throws(()=>generate(REMOVED,{seed:'x'}),/multi-part/);
 for(const e of catalog.filter(e=>e.layer==='bank'))for(let i=0;i<3;i++){const q=generate(e.id,{seed:'arcade-'+i,index:i});assert.ok(!/;/.test(q.answerText),`${e.id}: ${q.answerText}`);}
});

function staleWorkspace(){
 const dir=mkdtempSync(tmpdir()+'/arcade-v0110-'),path=dir+'/db.sqlite';
 const m=new Model(path,PW);const t=m.tx(s=>m.login(s,PW));
 const cid=m.tx(s=>m.classCreate(s,t,{name:'5A'}));m.tx(s=>m.roster(s,t,cid,['Ana','Ben']));
 // Write selections as an older Engine allowed them, bypassing today's validation.
 m.tx(s=>{
  const c=s.classes[0],[ana,ben]=c.students;
  c.config={...c.config,mode:'targeted',selected:[REMOVED,KEPT,K7]};
  ana.override={...c.config,mode:'targeted',selected:[REMOVED,REMOVED2]};
  s.mathSets=[{id:'set1',name:'Fractions',saved:1,config:{...c.config,selected:[REMOVED,KEPT]}}];
  // Ben has an open gate whose current question came from a removed skill, and a saved adventure gate.
  ben.math.config={...c.config,selected:[KEPT,K7]};const pr=new Practice(ben.math);pr.open('vault','g1');
  ben.math.gate.config.selected=[REMOVED,KEPT,K7];ben.math.gate.item={...ben.math.gate.item,skillId:REMOVED,prompt:'stale'};ben.math.gate.bag=[REMOVED];
  ben.activity={game:'vault7',gateId:'g1',itemId:'old-item',grant:false,round:null};
  ben.campaigns={chrono:{storage:{},revision:0,gates:{'relay:1':{count:5,gate:structuredClone(ben.math.gate),itemId:'old-camp',draft:'3/'}}}};
 });
 m.close();
 return {dir,path,t};
}

test('start-up cleanup removes unoffered questions from every saved selection and repairs open questions',()=>{
 const {dir,path}=staleWorkspace();
 const m=new Model(path,PW);
 try{
  const t=m.tx(s=>m.login(s,PW));
  m.tx(s=>{
   const c=s.classes[0],[ana,ben]=c.students;
   assert.deepEqual(c.config.selected,[KEPT,K7]);assert.equal(configError(c.config),'');
   assert.equal(ana.override,null,'an override left with no questions falls back to the class default');
   assert.deepEqual(s.mathSets[0].config.selected,[KEPT]);
   const g=ben.math.gate;assert.ok(find(g.item.skillId),'open question regenerated');assert.notEqual(g.item.prompt,'stale');
   assert.ok(g.config.selected.every(find));assert.ok(g.bag.every(find));assert.notEqual(ben.activity.itemId,'old-item');
   const cg=ben.campaigns.chrono.gates['relay:1'];assert.ok(find(cg.gate.item.skillId));assert.notEqual(cg.itemId,'old-camp');assert.equal(cg.draft,'');
   // Students can start again: the Engine accepts every effective selection.
   for(const p of c.students)new Practice(structuredClone(p.math)).saveConfig(p.override||c.config);
  });
  const view=m.tx(s=>m.teacherView(s,t));
  assert.equal(view.mathNotice.removed,2);assert.deepEqual(view.mathNotice.reasons,{'multi-part':2});
  assert.equal(view.mathNotice.places.classDefaults,1);assert.equal(view.mathNotice.places.mathSets,1);assert.ok(view.mathNotice.places.openQuestions>=2);
  assert.ok(m.tx(s=>m.saveMathSet(s,t,{classId:s.classes[0].id,name:'After'})).id,'saving a math set works again');
  m.tx(s=>m.dismissMathNotice(s,t));assert.equal(m.tx(s=>m.teacherView(s,t)).mathNotice,null);
 }finally{m.close();}
 // Idempotent: a clean workspace gets no new notice on the next start.
 const again=new Model(path,PW);
 try{const t=again.tx(s=>again.login(s,PW));assert.equal(again.tx(s=>again.teacherView(s,t)).mathNotice,null);}
 finally{again.close();rmSync(dir,{recursive:true,force:true});}
});

test('a class default left empty falls back to default practice, keeping the per-gate count',()=>{
 const dir=mkdtempSync(tmpdir()+'/arcade-v0110b-'),path=dir+'/db.sqlite';
 let m=new Model(path,PW);const t=m.tx(s=>m.login(s,PW));m.tx(s=>m.classCreate(s,t,{name:'5B'}));
 m.tx(s=>{const c=s.classes[0];c.config={...c.config,mode:'targeted',count:7,selected:[REMOVED]};});m.close();
 m=new Model(path,PW);
 try{m.tx(s=>{const c=s.classes[0];assert.equal(configError(c.config),'');assert.equal(c.config.count,7);assert.equal(c.config.mode,freshMath('S01').config.mode);});}
 finally{m.close();rmSync(dir,{recursive:true,force:true});}
});
