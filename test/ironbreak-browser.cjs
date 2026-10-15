const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');
(async()=>{const {createApp}=await import('../server/index.mjs');const {freshMath}=await import('../build/math/engine.js');const {GUIDED}=await import('../build/ironbreak/cartridges/ironbreak.js');const dir=fs.mkdtempSync(os.tmpdir()+'/arcade-iron-browser-');const {server,model}=createApp({dbPath:dir+'/db',password:'test-password-only'});let browser;await new Promise(r=>server.listen(0,'127.0.0.1',r));try{
const base='http://127.0.0.1:'+server.address().port;const code=model.tx(s=>{const t=model.login(s,'test-password-only'),cid=model.classCreate(s,t,{name:'Ironbreak Lab'});model.roster(s,t,cid,['Tim']);model.assign(s,t,cid,{config:{...freshMath().config,count:1}});model.session(s,t,cid,'open');return s.classes[0].session.code;});const state=()=>model.tx(s=>s.classes[0].students[0].activity?.round);const errors=[];browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const teacher=await browser.newPage({viewport:{width:1440,height:1000}}),student=await browser.newPage({viewport:{width:1180,height:820},hasTouch:true});for(const p of [teacher,student])p.on('pageerror',e=>errors.push(e.message));
await teacher.goto(base+'/?role=teacher');await teacher.locator('#password').fill('test-password-only');await teacher.getByRole('button',{name:'Sign in',exact:true}).click();await teacher.locator('[data-available="robot"]').waitFor();assert.equal(await teacher.locator('[data-available="robot"]').isChecked(),true);
await student.addInitScript(()=>{
 window.__inputDiagnostics=[];
 const record=(type,detail)=>{window.__inputDiagnostics.push({type,detail,at:performance.now()});if(window.__inputDiagnostics.length>80)window.__inputDiagnostics.shift();};
 for(const type of ['blur','resize','contextmenu','touchstart','touchend','touchcancel','pointercancel'])window.addEventListener(type,e=>record(type,{target:e.target?.dataset?.gameKey,touches:e.touches&&Array.from(e.touches,t=>t.identifier),changed:e.changedTouches&&Array.from(e.changedTouches,t=>t.identifier)}),true);
 let last;const frame=t=>{if(last&&t-last>200)record('frame-gap',t-last);last=t;requestAnimationFrame(frame);};requestAnimationFrame(frame);
});
await student.goto(base+'/?code='+code);await student.locator('#join-password').fill(model.tx(s=>s.classes[0].session.join.password));await student.locator('#join-name').click();await teacher.getByRole('button',{name:'Admit',exact:true}).click();await student.locator('[data-game="robot"]').click();await student.locator('#answer').fill(model.tx(s=>String(s.classes[0].students[0].math.gate.item.answer)));await student.locator('#check-answer').click();await student.locator('[data-iron-gear="spread"]').uncheck();await student.locator('#launch').click();await student.getByRole('button',{name:'Resume mission',exact:true}).click();await student.waitForTimeout(300);assert.deepEqual(state().snapshot.upgrades,['armor','agility']);assert.equal(state().running,true);
// A slow CI frame deliberately invokes Ironbreak's safety pause. Treat that as
// an interruption to verify and explicitly recover, never as a held-input timeout.
const cdp=await student.context().newCDPSession(student);
async function point(selector,id){const b=await student.locator(selector).boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2,id};}
const right=await point('[data-pad-cell="right"]',1),jump=await point('[data-game-key="jump"]',2);
let scenarioStarted=0;
const inputMatches=expected=>Object.entries(expected).every(([k,v])=>!!state().input[k]===v);
const details=()=>student.evaluate(()=>({events:window.__inputDiagnostics,overlay:document.querySelector('.vault-overlay')?.innerText,hidden:document.hidden,held:[...document.querySelectorAll('.held')].map(e=>e.dataset.gameKey)}));
const waitInput=async expected=>{
 const until=Date.now()+1500;
 while(Date.now()<until){
  if(inputMatches(expected))return;
  if(!state().running){
   const diagnostic=await details(),events=diagnostic.events.filter(e=>e.at>=scenarioStarted);
   if(events.some(e=>e.type==='frame-gap')&&!events.some(e=>['blur','resize','contextmenu'].includes(e.type))&&!diagnostic.hidden&&diagnostic.overlay.startsWith('Ready for Ironbreak?')&&state().snapshot.status==='active')
    throw Object.assign(Error('Verified slow-frame safety pause'),{code:'FRAME_PAUSE'});
  }
  await student.waitForTimeout(25);
 }
 assert.deepEqual(Object.fromEntries(Object.keys(expected).map(k=>[k,!!state().input[k]])),expected,'Input must reach server within the command lease: '+JSON.stringify(await details()));
};
let recoveries=0;
async function touchScenario(first,injectStall=false){
 for(let attempt=0;attempt<3;attempt++){
  scenarioStarted=await student.evaluate(()=>performance.now());
  try{
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[right,jump]});
   await waitInput({right:true,jump:true});
   if(injectStall&&attempt===0){
    // Reproduce a busy renderer deterministically, using the unchanged game.
    await student.evaluate(()=>{const until=performance.now()+350;while(performance.now()<until){}});
    const until=Date.now()+1500;
    while(state().running&&Date.now()<until)await student.waitForTimeout(25);
    assert.equal(state().running,false,'A stalled frame must safety-pause the round');
    await waitInput({right:true,jump:true}); // Must enter the narrowly scoped recovery below.
    assert.fail('A safety pause must clear held input');
   }
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[first==='right'?right:jump]});
   await waitInput({[first]:false,[first==='right'?'jump':'right']:true});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await waitInput({right:false,jump:false});
   return;
  }catch(error){
   if(error.code!=='FRAME_PAUSE'||attempt===2)throw error;
   assert.ok(inputMatches({right:false,jump:false}),'Safety pause must neutralize both server inputs');
   await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
   await student.waitForTimeout(100);
   assert.equal(state().running,false,'Safety pause must not resume automatically');
   await student.getByRole('button',{name:'Resume mission',exact:true}).click();
   await student.locator('.vault-overlay').waitFor({state:'hidden'});
   assert.equal(state().running,true);
   assert.ok(inputMatches({right:false,jump:false}),'Resume must require fresh intentional input');
   recoveries++;
   console.log('Verified slow-frame pause, neutral controls, explicit resume and fresh-input requirement.');
  }
 }
}
await touchScenario('right',true);
assert.ok(recoveries>=1,'The deterministic slow-frame regression must exercise recovery');
for(const first of ['right','jump'])await touchScenario(first);

await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[right]});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await student.waitForTimeout(200);assert.equal(state().input.right,false);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[right]});await student.evaluate(()=>window.dispatchEvent(new Event('blur')));await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await student.waitForTimeout(200);assert.equal(state().running,false);assert.ok(!state().input.right);await student.getByRole('button',{name:'Resume mission',exact:true}).click();assert.equal(await student.locator('.iron-root strong').first().evaluate(e=>e.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))),false);await student.getByRole('button',{name:'Resume mission',exact:true}).click();await teacher.locator('#pause-session').click();await student.getByRole('heading',{name:'Your teacher has paused the class.'}).waitFor();const elapsed=state().snapshot.elapsed;await student.waitForTimeout(300);assert.equal(state().snapshot.elapsed,elapsed);await teacher.locator('#pause-session').click();await student.getByRole('button',{name:'Resume mission',exact:true}).click();
await student.setViewportSize({width:820,height:1180});await student.waitForTimeout(250);assert.equal(state().running,false);await student.setViewportSize({width:1180,height:820});await student.getByRole('button',{name:'Resume mission',exact:true}).click();await student.waitForTimeout(200);assert.deepEqual(await student.evaluate(()=>({x:scrollX,y:scrollY,w:document.querySelector('.iron-root').getBoundingClientRect().width})),{x:0,y:0,w:1180});fs.mkdirSync('test-results',{recursive:true});assert.ok(await student.evaluate(()=>document.querySelector('.vault-stage').getBoundingClientRect().bottom<=document.querySelector('[data-objective]').getBoundingClientRect().top));await student.screenshot({path:'test-results/ironbreak-action.png'});
const roundId=state().id;await student.reload();await student.getByRole('button',{name:'Resume mission',exact:true}).waitFor();await student.waitForTimeout(200);assert.equal(state().id,roundId);assert.equal(state().running,false);await student.getByRole('button',{name:'Resume mission',exact:true}).click();student.once('dialog',d=>d.accept());await student.locator('[data-assist]').click();await student.locator('[data-choice]').first().waitFor();await student.screenshot({path:'test-results/ironbreak-guided.png'});for(let i=0;i<3;i++){await student.locator('[data-choice="'+GUIDED[i].answer+'"]').click();await student.waitForTimeout(180);}await student.getByRole('heading',{name:'Guided crossing complete.'}).waitFor();assert.equal(state().snapshot.outcome,'assisted_success');await student.getByRole('button',{name:'Back to arcade'}).click();await student.locator('[data-game="robot"]').click();await student.locator('#answer').waitFor();assert.equal(model.tx(s=>s.classes[0].students[0].math.gate.completed),0);assert.deepEqual(errors,[]);console.log('PASS Ironbreak browser: admission, gear, simultaneous touch/release, cancellation, blur/menu/pause/rotation, viewport, refresh, guided finish, replay gate; no page errors.');
}finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
