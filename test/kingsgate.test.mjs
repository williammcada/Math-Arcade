import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';
import {Model,games} from '../server/model.mjs';import {freshMath} from '../build/math/engine.js';import * as rounds from '../server/rounds.mjs';
import {resolveBreak} from '../build/kingsgate/games/kingsgate/sim.js';

function fixture(t,count=3){
 const dir=mkdtempSync(tmpdir()+'/arcade-kingsgate-');let now=1000,m=new Model(dir+'/db','test-password-only',{now:()=>now});t.after(()=>{m.close();rmSync(dir,{recursive:true,force:true});});
 const call=(method,...args)=>m.tx(s=>m[method](s,...args));const teacher=call('login','test-password-only'),cid=call('classCreate',teacher,{name:'Kingsgate'});
 call('roster',teacher,cid,['Solo']);call('assign',teacher,cid,{config:{...freshMath().config,count}});call('session',teacher,cid,'open');
 const c=call('teacherView',teacher).classes[0],token=call('join',{code:c.session.code,studentId:c.students[0].id,password:c.session.join.password});
 call('approve',teacher,call('teacherView',teacher).classes[0].claims[0].id,true);
 const raw=fn=>m.tx(s=>fn(s.classes[0].students[0]));const view=()=>call('studentView',token);let seq=0;
 const sync=(action,snapshot)=>call('sync',token,{roundId:view().activity.round.id,seq:++seq,action,keys:{},snapshot});
 return {call,teacher,cid,token,raw,view,sync,tick:ms=>{now+=ms;}};
}
// Play the device copy until the round asks for a question round.
function playToBreak(f){
 const v=f.view(),sim=structuredClone(v.activity.round.snapshot);
 for(let i=0;i<60*60&&sim.g.mode!=='break'&&!sim.outcome;i++)rounds.step('kingsgate',sim,{},1/60);
 return sim;
}

test('Kingsgate is listed and starts without a math gate',t=>{
 assert.ok(games.some(g=>g.id==='kingsgate'&&g.ready&&g.policy==='round'));
 const f=fixture(t),v=f.call('begin',f.token,'kingsgate');assert.equal(v.gate,null);assert.equal(v.activity.grant,true);
 const r=f.call('launch',f.token,{}).activity.round;assert.equal(r.snapshot.goldMode,'arcade');assert.equal(r.snapshot.g.gold,120);assert.equal(r.snapshot.arcadeMode,'action');
 assert.equal(rounds.limitFor('kingsgate'),300);
});

test('Question round before wave 2: one try per question, server-credited gold, clock stopped',t=>{
 const f=fixture(t,3);f.call('begin',f.token,'kingsgate');f.call('launch',f.token,{});f.sync('resume');
 const sim=playToBreak(f);assert.equal(sim.g.mode,'break');assert.equal(sim.g.breakFor,1);f.tick(500);
 const opened=f.call('kingsgate',f.token,{roundId:f.view().activity.round.id,commandId:'b1',action:'break',snapshot:{...sim,events:[]}});
 assert.equal(opened.state.gate.count,3);assert.equal(opened.state.activity.round.running,false,'clock stops during the round');
 const answer=(id,right)=>{const item=f.raw(p=>p.math.gate.item);const v=f.view();return f.call('kingsgate',f.token,{roundId:v.activity.round.id,commandId:id,action:'answer',itemId:v.gate.itemId,answer:right?String(item.answer):'definitely wrong 999'});};
 let r=answer('a1',true);assert.equal(r.result.correct,true);assert.equal(r.result.gold,30);
 r=answer('a2',false);assert.equal(r.result.correct,false);assert.ok(r.result.answerText!==null,'shows the correct answer');assert.equal(r.result.remaining,1);
 assert.throws(()=>f.call('kingsgate',f.token,{roundId:f.view().activity.round.id,commandId:'a2-retry',action:'answer',itemId:r.state.gate.itemId===undefined?'x':'stale',answer:'1'}),/Question changed/);
 r=answer('a3',true);assert.equal(r.result.complete,true);assert.deepEqual(r.result.breakResult,{answered:3,correct:2});assert.equal(r.state.gate,null);
 // The device may only claim what the server credited.
 f.sync('resume');
 const forged=structuredClone(sim);resolveBreak(forged.g,{answered:3,correct:3});assert.throws(()=>f.sync(undefined,{...forged,events:[]}),/exceeds the answers recorded/);
 const honest=structuredClone(sim);resolveBreak(honest.g,{answered:3,correct:2});const after=f.sync(undefined,{...honest,events:[]});
 assert.equal(after.activity.round.snapshot.g.stats.mathGold,60);assert.equal(after.activity.round.snapshot.g.gold,honest.g.gold);
 // Teacher sees the first attempts.
 const s=f.call('teacherView',f.teacher).classes[0].students[0];assert.equal(s.firstAttempts,3);assert.equal(s.firstCorrect,2);
});

test('A wave cannot start before its question round is answered',t=>{
 const f=fixture(t,1);f.call('begin',f.token,'kingsgate');f.call('launch',f.token,{});f.sync('resume');
 const sim=playToBreak(f),skipped=structuredClone(sim);skipped.g.mode='running';skipped.g.breakDone=1;skipped.g.breakFor=null;
 assert.throws(()=>f.sync(undefined,{...skipped,events:[]}),/question round/);
 assert.throws(()=>f.call('kingsgate',f.token,{roundId:f.view().activity.round.id,commandId:'early',action:'break',snapshot:{...structuredClone(f.view().activity.round.snapshot),events:[]}}),/No question round is due/);
 const changed=structuredClone(sim);changed.g.startGold=500;changed.g.gold+=380;assert.throws(()=>f.sync(undefined,{...changed,events:[]}),/settings cannot change/);
});

test('Kingsgate guided defense completes separately',t=>{
 const f=fixture(t);f.call('begin',f.token,'kingsgate');const r=f.call('launch',f.token,{}).activity.round;f.sync('resume');
 f.call('extra',f.token,{roundId:r.id,commandId:'g0',action:'assist'});
 for(let i=0;i<6;i++)f.call('extra',f.token,{roundId:r.id,commandId:'g'+(i+1),action:'safe',objective:String(i)});
 assert.equal(f.view().activity.round.snapshot.outcome,'assisted_completed');
});
