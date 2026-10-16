const {enterAnswer}=require('./answer-input.cjs');
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');
// Kingsgate in the browser: no opening gate, build by tapping the field, a server-checked question round before wave 2.
(async()=>{const {createApp}=await import('../server/index.mjs');const {freshMath}=await import('../build/math/engine.js');const dir=fs.mkdtempSync(os.tmpdir()+'/arcade-kingsgate-browser-');const {server,model}=createApp({dbPath:dir+'/db',password:'test-password-only'});let browser;await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 const base='http://127.0.0.1:'+server.address().port;
 const code=model.tx(s=>{const t=model.login(s,'test-password-only'),cid=model.classCreate(s,t,{name:'Kingsgate'});model.roster(s,t,cid,['Solo']);model.assign(s,t,cid,{config:{...freshMath().config,count:2,kgPerWave:2}});model.session(s,t,cid,'open');return s.classes[0].session.code;});
 const student0=()=>model.tx(s=>s.classes[0].students[0]);const errors=[];
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const teacher=await browser.newPage({viewport:{width:1440,height:1000}}),student=await browser.newPage({viewport:{width:Number(process.env.KG_W||1180),height:Number(process.env.KG_H||820)},hasTouch:true});
 for(const p of [teacher,student])p.on('pageerror',e=>errors.push(e.message));
 await teacher.goto(base+'/?role=teacher');await teacher.locator('#password').fill('test-password-only');await teacher.getByRole('button',{name:'Sign in',exact:true}).click();await teacher.locator('[data-available="kingsgate"]').waitFor();
 await student.goto(base+'/?code='+code);await student.locator('#join-password').fill(model.tx(s=>s.classes[0].session.join.password));await student.locator('#join-name').click();await teacher.getByRole('button',{name:'Admit',exact:true}).click();
 await student.locator('[data-game="kingsgate"]').waitFor();await student.locator('[data-game="kingsgate"]').click();
 await student.getByRole('button',{name:'Start Kingsgate'}).waitFor();assert.equal(student0().math.gate,null,'no math gate before Kingsgate');
 await student.getByRole('button',{name:'Start Kingsgate'}).click();
 await student.locator('.vault-overlay button.primary').waitFor();await student.waitForFunction(()=>!document.querySelector('.vault-overlay button.primary')?.disabled,null,{timeout:15000});
 await student.locator('.vault-overlay button.primary').click();await student.waitForTimeout(400);
 const box=await student.locator('.extra-root canvas').boundingBox();const k=Math.min(box.width/640,box.height/360),ox=(box.width-640*k)/2,oy=(box.height-360*k)/2;/* tap where the field is drawn, inside the letterbox */const tap=(x,y)=>student.mouse.click(box.x+ox+x*k,box.y+oy+y*k);
 // Build an Archer Tower on spot s2 (178,110); the menu's first button is the Archer.
 await tap(178,110);await student.waitForTimeout(150);
 const menuButton={x:0,y:0};{const w=5*60+4*4+12;const mx=Math.max(6,Math.min(640-w-6,178-w/2));menuButton.x=mx+6+30;menuButton.y=110+22+6+29;}
 await tap(menuButton.x,menuButton.y);await student.waitForTimeout(800);
 await student.screenshot({path:(process.env.SHOT_DIR||os.tmpdir())+'/kingsgate-arcade-build.png'});
 // The question round opens before wave 2 (about 28 s of play).
 await student.locator('.kg-break:not([hidden])').waitFor({timeout:45000});
 await student.screenshot({path:(process.env.SHOT_DIR||os.tmpdir())+'/kingsgate-arcade-break.png'});
 assert.equal(model.tx(s=>s.classes[0].students[0].activity.round.running),false,'clock stops during questions');
 for(let i=0;i<2;i++){const answer=String(student0().math.gate.item.answer);await enterAnswer(student.locator('.kg-break input'),i===0?answer:'999999');await student.locator('.kg-break button.primary').click();await student.locator('.kg-break .feedback').filter({hasText:i===0?'+30 gold':'Not quite'}).waitFor();await student.locator('.kg-break button.primary').click();}
 await student.locator('.kg-break').waitFor({state:'hidden'});await student.waitForTimeout(1500);
 const r=student0().activity.round;assert.equal(r.running,true);assert.equal(r.snapshot.g.stats.mathGold,30);assert.equal(r.snapshot.g.towers.length,1);assert.equal(r.snapshot.g.towers[0].type,'archer');
 assert.deepEqual(errors,[]);console.log('PASS Kingsgate browser'+(process.env.KG_LABEL?' ('+process.env.KG_LABEL+')':'')+': no opening gate, tap-to-build, server-checked question round before wave 2, gold credited, clock paused; no page errors.');
}finally{await browser?.close();server.close();fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exit(1);});
