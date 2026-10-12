// v0.4.1 regression: on a slow network, server replies must never pull a running
// avatar backward. Uses the real server model, real game simulations and the
// client's own keepLocal/outgoing logic, with 150 ms each way (300 ms round trip).
import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';
import {Model} from '../server/model.mjs';import {freshMath} from '../build/math/shared-math/engine.js';import * as rounds from '../server/rounds.mjs';
import {outgoing,keepLocal} from '../public/round-sync.js';

function classroom(t,game){
 const dir=mkdtempSync(tmpdir()+'/arcade-latency-');let now=1000;const m=new Model(dir+'/db','test-password-only',{now:()=>now});
 t.after(()=>{m.close();rmSync(dir,{recursive:true,force:true});});
 const call=(method,...args)=>m.tx(s=>m[method](s,...args));
 const teacher=call('login','test-password-only'),cid=call('classCreate',teacher,{name:'Latency'});call('roster',teacher,cid,['Solo']);
 call('assign',teacher,cid,{config:{...freshMath().config,count:1}});call('session',teacher,cid,'open');
 const c=call('teacherView',teacher).classes[0],token=call('join',{code:c.session.code,studentId:c.students[0].id,password:c.session.join.password});
 call('approve',teacher,call('teacherView',teacher).classes[0].claims[0].id,true);
 const v=call('begin',token,game),answer=m.tx(s=>String(s.classes[0].students[0].math.gate.item.answer));
 call('answer',token,{commandId:crypto.randomUUID(),itemId:v.gate.itemId,answer});
 return {view:call('launch',token,{}),sync:(at,body)=>{now=at;return call('sync',token,body);}};
}

// Plays `ms` of holding Right with requests every 140 ms and the given one-way delay.
// Returns the lowest frame-to-frame change in player.x seen on the device.
function play(t,game,{delay=150,ms=6000,adoptEveryReply=false}={}){
 const room=classroom(t,game),host={round:room.view.activity.round,sim:structuredClone(room.view.activity.round.snapshot),seq:room.view.activity.round.seq};
 const keys=Object.fromEntries(rounds.keysFor(game).map(k=>[k,k==='right']));
 const queue=[];let sending=false,clock=1000,worst=Infinity,last=host.sim.player.x;
 const send=(action)=>{sending=true;const body={roundId:host.round.id,seq:++host.seq,keys:host.round.running?keys:{},snapshot:outgoing(host,action),action};const sentAt=clock;
  queue.push({at:sentAt+delay,run:()=>{const reply=room.sync(sentAt+delay,body);queue.push({at:sentAt+2*delay,run:()=>{
   const keep=!adoptEveryReply&&keepLocal(host,reply,action);host.round=reply.activity.round;if(!keep)host.sim=structuredClone(host.round.snapshot);sending=false;}});}});};
 send('resume');
 for(let frame=0;frame*1000/60<ms;frame++){
  clock=1000+frame*1000/60;
  for(const e of queue.filter(e=>e.at<=clock).sort((a,b)=>a.at-b.at)){queue.splice(queue.indexOf(e),1);e.run();}
  if(frame%8===0&&!sending)send();
  if(host.round.running&&!host.sim.outcome){rounds.step(game,host.sim,{...keys},1/60);host.sim=rounds.snapshot(game,host.sim);}
  // Includes any change a server reply made since the previous frame.
  if(frame>30)worst=Math.min(worst,host.sim.player.x-last);last=host.sim.player.x;
 }
 return {worst,final:host.sim.player.x,round:host.round};
}

for(const game of ['coastal','robot','vault7'])test(game+': 300 ms round trip never pulls the running avatar backward',t=>{
 const now=play(t,game);
 assert.equal(now.round.running,true,'round keeps running with 300 ms latency (no auto-stop)');
 assert.ok(now.worst>=-1e-9,`avatar moved backward by ${-now.worst}px`);
 // Control: the v0.4.0 behavior (adopt every server reply) does snap backward,
 // which shows this test detects the reported bouncing.
 const old=play(t,game,{adoptEveryReply:true});
 assert.ok(old.worst<-1,`expected the old reply-overwrite to snap backward; worst ${old.worst}`);
});

test('accepted device snapshot is what the server keeps and resumes after reload',t=>{
 const room=classroom(t,'coastal');let r=room.view.activity.round;
 let v=room.sync(1100,{roundId:r.id,seq:1,keys:{},action:'resume'});r=v.activity.round;
 const sim=structuredClone(r.snapshot);for(let i=0;i<120;i++)rounds.step('coastal',sim,{right:true},1/60);
 v=room.sync(1200,{roundId:r.id,seq:2,keys:{},snapshot:rounds.snapshot('coastal',sim),action:'pause'});
 assert.equal(v.activity.round.running,false);assert.equal(v.activity.round.snapshot.player.x,sim.player.x);assert.equal(v.activity.round.snapshot.tick,sim.tick);
});
