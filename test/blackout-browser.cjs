const {enterAnswer}=require('./answer-input.cjs');
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');
// Blackout Protocol in the browser: math gate, equipment, a canvas tap turns the tapped tile, Energize reaches the device run,
// and a reload restores the same board (the puzzle object is rebuilt from the saved snapshot).
(async()=>{const {createApp}=await import('../server/index.mjs');const {freshMath}=await import('../build/math/engine.js');const dir=fs.mkdtempSync(os.tmpdir()+'/arcade-blackout-browser-');const {server,model}=createApp({dbPath:dir+'/db',password:'test-password-only'});let browser;await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 const base='http://127.0.0.1:'+server.address().port;
 const code=model.tx(s=>{const t=model.login(s,'test-password-only'),cid=model.classCreate(s,t,{name:'Blackout'});model.roster(s,t,cid,['Solo']);model.assign(s,t,cid,{config:{...freshMath().config,count:1}});model.session(s,t,cid,'open');return s.classes[0].session.code;});
 const round=()=>model.tx(s=>s.classes[0].students[0].activity?.round);const errors=[];
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const teacher=await browser.newPage({viewport:{width:1440,height:1000}}),student=await browser.newPage({viewport:{width:1180,height:820},hasTouch:true});
 for(const p of [teacher,student])p.on('pageerror',e=>errors.push(e.message));
 await teacher.goto(base+'/?role=teacher');await teacher.locator('#password').fill('test-password-only');await teacher.getByRole('button',{name:'Sign in',exact:true}).click();await teacher.locator('[data-available="blackout"]').waitFor();
 await student.goto(base+'/?code='+code);await student.locator('#join-password').fill(model.tx(s=>s.classes[0].session.join.password));await student.locator('#join-name').click();await teacher.getByRole('button',{name:'Admit',exact:true}).click();
 const card=student.locator('.game-card:has([data-game="blackout"])');await card.waitFor();
 assert.match(await card.innerText(),/Blackout Protocol/);assert.equal(await card.locator('.visual img').getAttribute('src'),'/covers/blackout.svg');
 assert.ok(await card.locator('.visual img').evaluate(i=>i.complete&&i.naturalWidth>0),'card art loads');
 await student.locator('[data-game="blackout"]').click();await student.locator('#answer').waitFor();
 await enterAnswer(student.locator('#answer'),model.tx(s=>String(s.classes[0].students[0].math.gate.item.answer)));await student.locator('#check-answer').click();
 await student.locator('.arcade-story').waitFor();await student.locator('[data-extra-gear="spare-fuse"]').waitFor();
 for(const id of ['grid-scanner','surge-stabilizer'])await student.locator(`[data-extra-gear="${id}"]`).uncheck();
 await student.locator('#launch').click();await student.locator('.vault-overlay button:not([disabled])').waitFor({timeout:15000});
 assert.equal(round().snapshot.game.fuses,4,'Spare Fuse gives four fuses');assert.equal(await student.locator('[data-assist]').count(),0,'no guided route');
 await student.locator('.vault-overlay button').click();for(let t=0;t<100&&!round().running;t++)await student.waitForTimeout(50);for(let t=0;t<100&&(round().running)!==true;t++)await student.waitForTimeout(50);assert.equal(round().running,true);
 // Wait until the device itself is playing (its Pause button shows), not only the server: taps are ignored while paused.
 await student.locator('[data-pause]').filter({hasText:/^Pause$/}).waitFor({timeout:10000});await student.locator('.vault-overlay').waitFor({state:'hidden'});
 // Tap an unlocked tile: the device rotates exactly that tile and its next snapshot reaches the server.
 const board=round().snapshot.game.board,n=board.n,size=336/n,index=board.tiles.findIndex(t=>!t.locked&&!t.storm&&t.kind==='wire');assert.ok(index>=0);
 const before=board.tiles[index].rot,cx=12+(index%n+.5)*size,cy=12+(Math.floor(index/n)+.5)*size;
 const box=await student.locator('.extra-root canvas').boundingBox(),k=Math.min(box.width/640,box.height/360),ox=(box.width-640*k)/2,oy=(box.height-360*k)/2;
 await student.touchscreen.tap(box.x+ox+cx*k,box.y+oy+cy*k);
 const until=Date.now()+8000;while(Date.now()<until&&round().snapshot.game.board.tiles[index].rot===before)await student.waitForTimeout(50);
 assert.equal(round().snapshot.game.board.tiles[index].rot,(before+1)%4,'the tapped tile turned a quarter turn');
 // Energize from the on-screen button: a latched press counts once even when shorter than a frame.
 const presses=round().snapshot.game.stats?.energize??null;await student.locator('[data-game-key="energize"]').tap();await student.waitForTimeout(900);
 const after=round().snapshot.game;assert.ok(after.fuses<4||after.restored.length>0||(presses!==null&&after.stats.energize>presses),'Energize reached the puzzle');
 fs.mkdirSync('test-results',{recursive:true});await student.screenshot({path:'test-results/blackout-action.png'});
 // Pause, reload and resume: the same board continues (the puzzle is rebuilt from the saved snapshot).
 await student.locator('[data-pause]').filter({hasText:/^Pause$/}).click();for(let t=0;t<40&&round().running;t++)await student.waitForTimeout(50);const saved=round();
 await student.reload();await student.locator('.vault-overlay button:not([disabled])').waitFor({timeout:15000});assert.equal(round().id,saved.id);
 await student.locator('.vault-overlay button').click();for(let t=0;t<60&&!round().running;t++)await student.waitForTimeout(50);await student.waitForTimeout(600);
 assert.deepEqual(round().snapshot.game.board.tiles.map(t=>t.base),saved.snapshot.game.board.tiles.map(t=>t.base),'same board after reload');assert.ok(round().snapshot.time>saved.snapshot.time,'the run continues after reload');
 student.once('dialog',d=>d.accept());await student.locator('[data-exit]').click();await student.locator('[data-game="blackout"]').waitFor();
 assert.deepEqual(errors,[]);console.log('PASS Blackout browser: card art, gate, equipment, tap turns the tapped tile, Energize latched, reload restores the same board; no page errors.');
}finally{await browser?.close();server.close();fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exit(1);});
