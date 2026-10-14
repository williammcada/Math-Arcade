import {device} from './device.mjs';import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';
import {Model,games} from '../server/model.mjs';import {freshMath} from '../build/math/engine.js';import * as rounds from '../server/rounds.mjs';
import {nextObjective} from '../build/nightfall/games/nightfall/simulation.js';
function fixture(t){const dir=mkdtempSync(tmpdir()+'/arcade-extra-');let now=1000,m=new Model(dir+'/db','test-password-only',{now:()=>now});t.after(()=>{m.close();rmSync(dir,{recursive:true,force:true});});const call=(method,...args)=>m.tx(s=>m[method](s,...args));const teacher=call('login','test-password-only'),cid=call('classCreate',teacher,{name:'Extra games'});call('roster',teacher,cid,['Solo']);call('assign',teacher,cid,{config:{...freshMath().config,count:1}});call('session',teacher,cid,'open');const c=call('teacherView',teacher).classes[0],token=call('join',{code:c.session.code,studentId:c.students[0].id,password:c.session.join.password});call('approve',teacher,call('teacherView',teacher).classes[0].claims[0].id,true);const raw=fn=>m.tx(s=>fn(s.classes[0].students[0]));const view=()=>call('studentView',token);let seq=0;const dev=device();const sync=(action,keys={},ms=0)=>{const v=view();return call('sync',token,{roundId:v.activity.round.id,seq:++seq,action,keys,snapshot:dev.play(v,ms,keys)});};return {call,teacher,cid,token,raw,view,sync,advance:(ms,keys={})=>{now+=ms;return sync(undefined,keys,ms);},gate:game=>{const v=call('begin',token,game);assert.equal(v.gate.count,1);assert.throws(()=>call('launch',token));call('answer',token,{commandId:crypto.randomUUID(),itemId:v.gate.itemId,answer:raw(p=>String(p.math.gate.item.answer))});},restart:()=>{m.close();m=new Model(dir+'/db','test-password-only',{now:()=>now});}};}
for(const game of ['false-haven','blackline','journey','blackout'])test(game+': gate, one grant, teacher control, neutral input and exact restart',t=>{
 const f=fixture(t);f.gate(game);if(game==='journey')assert.throws(()=>f.call('launch',f.token,{hero:'fake'}));else assert.throws(()=>f.call('launch',f.token,{loadout:['fake']}));
 const r=f.call('launch',f.token,game==='journey'?{hero:'prince',upgrade:'reserve'}:{}).activity.round;assert.equal(f.call('launch',f.token).activity.round.id,r.id);assert.equal(r.snapshot.outcome,null);
 f.sync('resume');for(let i=0;i<25;i++)f.advance(140,{right:true,attack:true});f.sync('pause');const before=f.view().activity.round.snapshot;assert.ok(before.time>0);f.restart();assert.equal(f.view().activity.round.id,r.id);assert.equal(f.view().activity.round.running,false);assert.deepEqual(f.view().activity.round.snapshot,before);assert.ok(Object.values(f.raw(p=>p.activity.round.input)).every(v=>!v));
 f.sync('resume');f.call('session',f.teacher,f.cid,'pause');const paused=f.view().activity.round.snapshot;f.advance(500);assert.deepEqual(f.view().activity.round.snapshot,paused);assert.throws(()=>f.sync('resume'));f.call('session',f.teacher,f.cid,'resume');f.sync('resume');f.advance(10001);assert.equal(f.view().activity.round.running,false);assert.ok(Object.values(f.raw(p=>p.activity.round.input)).every(v=>!v));
 f.call('leave',f.token);f.call('availability',f.teacher,f.cid,[]);assert.throws(()=>f.call('begin',f.token,game));f.call('availability',f.teacher,f.cid,[game]);assert.ok(f.call('begin',f.token,game).gate);assert.equal(f.raw(p=>p.math.events.filter(e=>e.type==='gate-complete').length),1);
});
test('Nightfall chapters are distinct; False Haven objectives preserve canonical machinery and separate guided success',()=>{
 assert.notEqual(games.find(g=>g.id==='nightfall').name,games.find(g=>g.id==='false-haven').name);
 const s=rounds.createRound('false-haven',{runId:'test'},{});assert.ok(s.haven);rounds.extraAction('false-haven',s,{action:'assist'});let steps=0;while(!s.outcome&&steps++<30){const objective=nextObjective(s)?.id;rounds.extraAction('false-haven',s,{action:'safe',objective});}assert.equal(s.outcome,'assisted_completed');assert.ok(steps>6);
});
test('Blackline accelerates without an accelerator key, spawns pursuers and spends its five-minute budget',()=>{
 const s=rounds.createRound('blackline',{runId:'test'},{});for(let i=0;i<600;i++)rounds.step('blackline',s,{},1/60);assert.ok(s.race.v>0);assert.ok(s.race.stats.spawned>0);s.race.t=299.999;rounds.step('blackline',s,{},1/60);assert.equal(s.outcome,'timed_out');
});
test('Journey has exactly one chosen hero; three lives and fixed three-minute budget',()=>{
 const s=rounds.createRound('journey',{runId:'test'},{hero:'prince',upgrade:'reserve'});assert.deepEqual(Object.keys(s.model.players),['solo']);assert.equal(s.model.players.solo.hero,'prince');assert.equal(s.model.players.solo.lives,3);assert.equal(s.model.players.solo.capacity,4);for(let i=0;i<190;i++)rounds.step('journey',s,{},1/60);assert.equal(s.model.phase,'running');s.model.activeMs=179999;rounds.step('journey',s,{},1/60);assert.equal(s.outcome,'timed_out');
});

test('Blackout Protocol: listed equipment only, puzzle controls, no guided route and a five-minute budget',()=>{
 assert.ok(games.some(g=>g.id==='blackout'&&g.policy==='round'&&g.ready));
 assert.throws(()=>rounds.createRound('blackout',{runId:'test'},{loadout:['carbine']}));
 assert.throws(()=>rounds.createRound('blackout',{runId:'test'},{loadout:['spare-fuse','spare-fuse']}));
 const s=rounds.createRound('blackout',{runId:'test'},{loadout:['spare-fuse']});assert.equal(s.arcadeMode,'action');assert.equal(s.game.fuses,4);
 assert.deepEqual(rounds.keysFor('blackout'),['left','right','up','down','rotate','energize','scan']);
 assert.throws(()=>rounds.extraAction('blackout',s,{action:'assist'}),/puzzle controls/);
 for(let i=0;i<120;i++)rounds.step('blackout',s,{},1/60);assert.ok(s.time>1.9&&s.time<2.1);
 assert.equal(rounds.limitFor('blackout'),300);assert.equal(rounds.timeoutOutcome('blackout'),'timed_out');
 const copy=rounds.acceptSnapshot('blackout',{arcadeMode:'action',outcome:null},JSON.parse(JSON.stringify(s)));assert.equal(copy.game.fuses,4);
});
