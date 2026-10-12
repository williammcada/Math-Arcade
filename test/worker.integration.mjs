import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {once} from 'node:events';
import {setTimeout as delay} from 'node:timers/promises';
import {freshMath} from '../build/math/engine.js';
import * as rounds from '../server/rounds.mjs';

test('Cloudflare runtime: atomic joins, ten games, isolation, persistence and browser delivery',{timeout:180000},async t=>{
 const dir=mkdtempSync(tmpdir()+'/arcade-worker-');let child,base,log='';
 async function start(){
  child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','dev','build/worker/worker.js','--no-bundle','--local','--port','8797','--persist-to',dir,'--var','ARCADE_TEACHER_PASSWORD:test-password-only'],{env:{...process.env,WRANGLER_SEND_METRICS:'false'},stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',b=>{log+=b;});child.stderr.on('data',b=>{log+=b;});base='http://localhost:8797';
  for(let i=0;i<150;i++){if(child.exitCode!==null)throw Error(log);try{if((await fetch(base+'/health')).ok)return;}catch{}await delay(200);}
  throw Error('Worker did not start: '+log);
 }
 async function stop(){if(child&&child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended;}}
 t.after(async()=>{await stop();mkdirSync('test-results',{recursive:true});writeFileSync('test-results/worker-runtime.log',log);rmSync(dir,{recursive:true,force:true});});
 await start();
 const call=async(path,body,cookie='',status=200)=>{
  const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{origin:base,'content-type':'application/json',cookie},body:body===undefined?undefined:JSON.stringify(body)});
  const data=await r.json();assert.equal(r.status,status,JSON.stringify({path,data}));return {data,cookie:r.headers.get('set-cookie')?.split(';')[0],response:r};
 };
 assert.equal((await call('/health')).data.architecture,'cloudflare-durable-object');
 await call('/api/teacher',undefined,'',401);
 const denied=await fetch(base+'/api/login',{method:'POST',headers:{origin:'https://other.invalid','content-type':'application/json'},body:'{}'});assert.equal(denied.status,403);
 await call('/api/login',null,'',400);
 const teacher=(await call('/api/login',{password:'test-password-only'})).cookie;
 const teacherCall=async(path,body,status=200)=>(await call('/api/'+path,body,teacher,status)).data;
 const cid=(await teacherCall('class',{name:'Worker lab'})).id;
 await teacherCall('roster',{classId:cid,names:Array.from({length:23},(_,i)=>'Student '+(i+1))});
 await teacherCall('assign',{classId:cid,config:{...freshMath('S01').config,count:1}});
 await teacherCall('session',{classId:cid,action:'open'});
 const view=async()=>(await teacherCall('teacher')).classes[0];
 let c=await view();
 const input={code:c.session.code,password:c.session.join.password,studentId:c.students[0].id};
 const redeem=()=>fetch(base+'/api/join',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify(input)});
 const race=await Promise.all([redeem(),redeem()]);assert.deepEqual(race.map(r=>r.status).sort(),[200,403]);
 let student=race.find(r=>r.ok).headers.get('set-cookie').split(';')[0];
 await call('/api/begin',{game:'math-civ'},student,403);
 await teacherCall('approve',{id:(await view()).claims[0].id,allow:true});
 const studentCall=async(path,body,status=200)=>(await call('/api/'+path,body,student,status)).data;
 await call('/api/teacher',undefined,student,401);
 for(const path of ['/math-civ/index.html','/math-civ/game.js','/math-civ%2Fgame.js','/chrono/index.html','/olivia/index.html'])assert.equal((await fetch(base+path)).status,401,path);
 for(const path of ['/server/worker.mjs','/vendor/manifest.json','/data/arcade.sqlite','/build/provenance.json'])assert.equal((await fetch(base+path)).status,404,path);
 const home=await fetch(base+'/');assert.match(await home.text(),/<title>Math Arcade v0.5.0-rc.3<\/title>/);
 assert.match(home.headers.get('content-security-policy'),/frame-ancestors 'none'/);
 // All seven authoritative round engines execute in workerd, with one start gate.
 for(const game of ['coastal','vault7','nightfall','robot','false-haven','blackline','journey']){
  const initial=await studentCall('begin',{game});assert.equal(initial.gate.count,1);
  await studentCall('launch',{},403);
  const saved=(await teacherCall('export')).classes[0].students[0];
  const body={commandId:crypto.randomUUID(),itemId:initial.gate.itemId,answer:String(saved.math.gate.item.answer)};
  assert.ok((await studentCall('answer',body)).result.complete);
  assert.ok((await studentCall('answer',body)).result.complete);
  const round=(await studentCall('launch',{})).activity.round;
  assert.equal((await studentCall('launch',{})).activity.round.id,round.id);
  const resumed=(await studentCall('sync',{roundId:round.id,seq:1,action:'resume',keys:{right:true}})).activity.round;
  if(game==='coastal'){
   // v0.4.1: the device runs the round and reports its snapshot to the Worker.
   await delay(100);
   const sim=structuredClone(resumed.snapshot);for(let i=0;i<6;i++)rounds.step('coastal',sim,{right:true},1/60);
   const before=(await studentCall('sync',{roundId:round.id,seq:2,keys:{right:true},snapshot:rounds.snapshot('coastal',sim)})).activity.round;
   assert.ok(before.snapshot.tick>0);assert.equal(before.snapshot.tick,sim.tick);
   await stop();await start();
   const after=(await studentCall('student')).activity.round;
   assert.equal(after.id,before.id);assert.equal(after.running,false);assert.deepEqual(after.snapshot,before.snapshot);
   assert.deepEqual((await teacherCall('export')).classes[0].students[0].activity.round.input,{});
  }
  await teacherCall('session',{classId:cid,action:'pause'});
  await studentCall('sync',{roundId:round.id,seq:10,action:'resume'},409);
  await teacherCall('session',{classId:cid,action:'resume'});
  await studentCall('leave',{});
 }
 // Native gates retain credit, drafts, snapshots, leases and revisions.
 for(const game of ['chrono','olivia']){
  assert.equal((await studentCall('begin',{game})).gate,null);
  const load=await studentCall('campaign',{game,action:'load'});
  const gate=await studentCall('campaign',{game,action:'gate',lease:load.lease,key:'worker-gate'});
  const saved=(await teacherCall('export')).classes[0].students[0];
  await studentCall('answer',{commandId:crypto.randomUUID(),itemId:gate.state.gate.itemId,answer:String(saved.math.gate.item.answer)});
  assert.ok((await studentCall('campaign',{game,action:'gate',lease:load.lease,key:'worker-gate'})).complete);
  assert.equal((await fetch(base+'/'+game+'/index.html',{headers:{cookie:student}})).status,200);
  await studentCall('leave',{});
 }
 const game='math-civ';assert.equal((await studentCall('begin',{game})).gate,null);
 let load=await studentCall('campaign',{game,action:'load'});
 await studentCall('campaign',{game,action:'gate',lease:load.lease,key:'fake'},400);
 // >2 MB, Unicode and chunk boundaries survive actual Durable Object SQL storage.
 const storage={'mc-save-fallback-v1':'島😀'.repeat(300000)};
 await studentCall('campaign',{game,action:'save',lease:load.lease,revision:0,storage});
 await studentCall('campaign',{game,action:'save',lease:load.lease,revision:0,storage:{}},409);
 const old=load.lease;load=await studentCall('campaign',{game,action:'load'});
 await studentCall('campaign',{game,action:'save',lease:old,revision:1,storage:{}},409);
 await teacherCall('session',{classId:cid,action:'pause'});
 assert.equal((await studentCall('campaign',{game,action:'poll',lease:load.lease})).playing,false);
 await teacherCall('session',{classId:cid,action:'resume'});
 const asset=await fetch(base+'/math-civ/index.html',{headers:{cookie:student}});
 assert.equal(asset.status,200);assert.match(asset.headers.get('cache-control'),/no-store/);assert.match(await asset.text(),/Math Arcade v0.5.0-rc.3/);
 // Restart the entire workerd process using the same persistent directory.
 await stop();await start();
 load=await studentCall('campaign',{game,action:'load'});assert.deepEqual(load.storage,storage);
 // Remove the large fixture before testing ordinary browser behavior.
 await studentCall('campaign',{game,action:'save',lease:load.lease,revision:load.revision,storage:{}});
 const peers=[student];
 for(let i=1;i<23;i++){
  const password=(await teacherCall('new-password',{classId:cid})).password;
  const u=(await call('/api/join',{code:c.session.code,password,studentId:c.students[i].id})).cookie;
  await teacherCall('approve',{id:(await view()).claims[0].id,allow:true});peers.push(u);
 }
 const concurrent=await Promise.all(peers.map(cookie=>call('/api/student',undefined,cookie)));
 assert.equal(new Set(concurrent.map(r=>r.data.name)).size,23);
 const other=peers[1];await call('/api/begin',{game},other);
 assert.deepEqual((await call('/api/campaign',{game,action:'load'},other)).data.storage,{});
 const replacementPassword=(await teacherCall('new-password',{classId:cid})).password;
 const replacement=(await call('/api/join',{code:c.session.code,password:replacementPassword,studentId:c.students[0].id})).cookie;
 await teacherCall('approve',{id:(await view()).claims[0].id,allow:true});
 await call('/api/student',undefined,student,401);student=replacement;
 // Live browser against the Worker, including protected adventure boot and save/back.
 const {chromium}=await import('playwright');
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/tmp/chromium',args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:1180,height:820},hasTouch:true});
  await context.addCookies([{name:'student',value:student.slice('student='.length),url:base}]);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await studentCall('leave',{});await page.goto(base);await page.locator('[data-game="math-civ"]').click();
  const frame=page.frameLocator('iframe');await frame.locator('[data-action=new]').click();await frame.locator('[data-action=start]').click();
  await frame.locator('.arcade-story').waitFor();await frame.locator('.arcade-directions').waitFor();
  mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/worker-math-civ.png'});
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
 await teacherCall('session',{classId:cid,action:'end'});
 assert.equal((await fetch(base+'/math-civ/game.js',{headers:{cookie:student}})).status,403);
 await teacherCall('delete',{classId:cid,studentId:c.students[0].id,confirm:'no'},400);
 await teacherCall('delete',{classId:cid,studentId:c.students[0].id,confirm:'DELETE'});
 await studentCall('student',undefined,401);assert.equal((await view()).students.length,22);
 await teacherCall('delete',{classId:cid,confirm:'DELETE'});
 await stop();await start();assert.equal((await teacherCall('teacher')).classes.length,0);
 const newClass=(await teacherCall('class',{name:'Fresh start'})).id;assert.ok(newClass);
 await teacherCall('delete',{classId:'all',confirm:'DELETE'});
 console.log('Worker passed: 23 concurrent identities, 10 game policies, storage restart, asset authorization and Chromium adventure.');
});
