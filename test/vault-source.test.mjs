// Adapted from MathQuest 59c11c90 test/stealth.test.mjs; old client recovery test excluded because Arcade uses server snapshots.
import test from 'node:test';
import assert from 'node:assert/strict';
import {StealthSimulation,createLevel,validateLevel,angleAt,conePolygon,coverage,inCone,RULES} from '../build/vault7/stealth-core.js';
import {fallbackScene} from '../build/vault7/fallback.js';
const step=(s,n,input={})=>{for(let i=0;i<n;i++)s.step(typeof input==='function'?input(i):input);};

test('both maps have clear spawn/checkpoints and toolkit begins with manual charges',()=>{
  for(const route of ['shaft','corridor']){assert.deepEqual(validateLevel(createLevel(route)),[]);const base=createLevel(route),kit=createLevel(route,'toolkit');assert.equal(base.emitters.filter(e=>e.disabled).length,0);assert.equal(kit.emitters.filter(e=>e.disabled).length,0);}
});
test('fixed simulation has expected speed, jump height, landing and early jump release',()=>{
  const s=new StealthSimulation();s.start();step(s,2);step(s,60,{right:true});assert.equal(s.player.vx,72);assert.ok(s.player.x>98&&s.player.x<102);
  const a=new StealthSimulation(),b=new StealthSimulation();a.start();b.start();step(a,2);step(b,2);let minA=136,minB=136;
  for(let i=0;i<80;i++){a.step({jump:i<60});b.step({jump:i<5});minA=Math.min(minA,a.player.y);minB=Math.min(minB,b.player.y);}
  assert.ok(136-minA>=38.9&&136-minA<=42);assert.ok(minB>minA+15);assert.equal(a.player.y,136);
});
test('coyote window and landing buffer allow forgiving keyboard/touch jumps',()=>{
  const s=new StealthSimulation();s.start();s.player.y=100;s.player.grounded=false;s.coyote=.1;step(s,5);s.step({jump:true});assert.ok(s.player.vy<0);
  const late=new StealthSimulation();late.start();late.player.y=100;late.coyote=.1;step(late,7);late.step({jump:true});assert.ok(late.player.vy>0);
  const buffered=new StealthSimulation();buffered.start();buffered.player.y=129;buffered.player.vy=150;buffered.step({jump:true});step(buffered,4,{jump:true});assert.ok(buffered.player.vy<0);
});
test('common cover fully occludes light and forecast uses the actual future geometry',()=>{
  const l=createLevel('corridor','scanner'),e=l.emitters[2];
  for(let t=0;t<20;t+=.2)assert.equal(coverage(l,{x:106,y:136},t),0);
  assert.equal(inCone(l,e,e.x,e.y+45,0),true);
  assert.deepEqual(conePolygon(l,e,7),conePolygon(l,e,5+2));
  assert.notEqual(angleAt(e,1,3),angleAt(e,1,0));
});
test('sensor detections consume integrity once per contact and three captures are terminal',()=>{
  const s=new StealthSimulation();s.start();s.panel=true;Object.assign(s.player,{x:452,y:136});s.step();assert.equal(s.detections,1);step(s,30);assert.equal(s.detections,1);
  step(s,60);assert.equal(s.state,'playing');assert.ok(s.immunity>0);s.immunity=0;s.detect('test');step(s,70);s.immunity=0;s.detect('test');step(s,20);assert.equal(s.outcome,'captured');assert.equal(s.integrity,0);
});
test('base jump clears the corridor sensor from its launch crate without equipment',()=>{
  const s=new StealthSimulation({route:'corridor'});s.start();s.panel=true;Object.assign(s.player,{x:438,y:120,grounded:true});step(s,65,{right:true,jump:true});assert.equal(s.detections,0);assert.ok(s.player.x>490);
});
test('shaft route is traversable at base speed with hazards active and no powerup',()=>{
  const s=new StealthSimulation({route:'shaft'});s.start();let hold=0,cool=0;
  for(let i=0;i<10000&&s.state!=='terminal';i++){
    const p=s.player,x=Math.floor((p.x+28)/16),solid=s.level.grid[9][x]===1||s.level.grid[8][x]===1;
    if(p.grounded&&cool<=0&&solid){hold=.55;cool=.8;}hold-=RULES.step;cool-=RULES.step;
    const near=s.level.sensors.find(v=>v.h>4&&v.x>p.x&&v.x-p.x<32),wait=near&&((s.elapsed+near.phase)%(near.on+near.off))<near.on;
    s.step({right:!wait,jump:hold>0,interact:true});
  }
  assert.equal(s.outcome,'extracted');assert.equal(s.checkpoint,'C');assert.ok(s.detections<3);
});

test('corridor route is traversable with timed sensor crossing and a jump from the launch crate',()=>{
  const s=new StealthSimulation({route:'corridor'});s.start();let hold=0,cool=0,mode=0;
  for(let i=0;i<10000&&s.state!=='terminal';i++){
    const p=s.player,x=Math.floor((p.x+28)/16),solid=s.level.grid[9][x]===1||s.level.grid[8][x]===1;let right=true,left=false;
    if(mode===0&&p.x>399){mode=1;hold=.6;cool=1;}
    if(mode===1){const desired=Math.max(-72,Math.min(72,(437-p.x)*6));right=p.vx<desired-5;left=p.vx>desired+5;if(p.grounded&&p.y===120&&Math.abs(p.x-437)<7){mode=2;hold=0;}}
    else if(mode===2){hold=.75;cool=1;mode=3;right=true;}
    else if(p.grounded&&cool<=0&&solid){hold=.55;cool=.8;}
    hold-=RULES.step;cool-=RULES.step;const near=s.level.sensors.find(v=>v.h>4&&v.x>p.x&&v.x-p.x<32);
    if(near){const phase=(s.elapsed+near.phase)%(near.on+near.off),cross=(near.x+near.w-p.x)/72;if(phase<near.on||near.on+near.off-phase<cross)right=false;}
    s.step({right,left,jump:hold>0,interact:true});
  }
  assert.equal(s.outcome,'extracted');assert.equal(s.detections,0);assert.equal(s.checkpoint,'C');
});
test('exit requires holding interact; active timer cannot run past 180 seconds',()=>{
  const s=new StealthSimulation();s.start();s.panel=true;s.card=true;s.player.x=978;s.checkpoint='C';step(s,30,{interact:true});assert.equal(s.outcome,null);step(s,7,{interact:true});assert.equal(s.outcome,'extracted');
  const timeout=new StealthSimulation({}, {activeElapsedMs:179990});timeout.start();timeout.step();assert.equal(timeout.outcome,'timeout');assert.equal(timeout.summary().activeElapsedMs,180000);
});
test('accessible scenes have unique text-grounded answers and the same equipment effects',()=>{
  for(const route of ['shaft','corridor'])for(let alert=0;alert<4;alert++)for(let step=0;step<3;step++){
    const scene=fallbackScene(route,step,'scanner',alert);assert.equal(new Set(scene.options).size,3);assert.ok(scene.correct>=0&&scene.correct<3);assert.ok(scene.text.length>70);
  }
  assert.equal(fallbackScene('shaft',1,'toolkit').toolkit,true);
});
