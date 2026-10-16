// Math Arcade v0.10.2 (game-loading spec, Phase 4): the chosen game's artwork downloads while
// the student is on its math gate, before Start is pressed; other games' art is not downloaded;
// the round then starts with that art and requests no second copy.
const {enterAnswer}=require('./answer-input.cjs');
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');
(async()=>{const {createApp}=await import('../server/index.mjs');const {freshMath}=await import('../build/math/engine.js');const dir=fs.mkdtempSync(os.tmpdir()+'/arcade-art-preload-');const {server,model}=createApp({dbPath:dir+'/db',password:'test-password-only'});let browser;await new Promise(r=>server.listen(0,'127.0.0.1',r));try{
 const base='http://127.0.0.1:'+server.address().port;
 const code=model.tx(s=>{const t=model.login(s,'test-password-only'),cid=model.classCreate(s,t,{name:'Preload'});model.roster(s,t,cid,['Solo']);model.assign(s,t,cid,{config:{...freshMath().config,count:1}});model.session(s,t,cid,'open');return s.classes[0].session.code;});
 const errors=[],art=[];browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const teacher=await browser.newPage({viewport:{width:1440,height:1000}}),student=await browser.newPage({viewport:{width:1180,height:820},hasTouch:true});
 for(const p of [teacher,student])p.on('pageerror',e=>errors.push(e.message));
 let phase='home';
 student.on('request',r=>{const m=r.url().match(/\/(journey|nightfall|blackline|kingsgate|blackout|coastal)\/(?:public\/)?assets\/[^?]+\.(webp|png|svg)/);if(m)art.push({game:m[1],file:m[0],phase});});
 student.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/api/student'))errors.push(r.status()+' '+r.url());});
 await teacher.goto(base+'/?role=teacher');await teacher.locator('#password').fill('test-password-only');await teacher.getByRole('button',{name:'Sign in',exact:true}).click();await teacher.locator('[data-available="journey"]').waitFor();
 await student.goto(base+'/?code='+code);await student.locator('#join-password').fill(model.tx(s=>s.classes[0].session.join.password));await student.locator('#join-name').click();await teacher.getByRole('button',{name:'Admit',exact:true}).click();await student.locator('[data-game="journey"]').waitFor();
 assert.equal(art.length,0,'No game art downloads on the game list: '+JSON.stringify(art));
 phase='gate';await student.locator('[data-game="journey"]').click();await student.locator('#answer').waitFor();
 for(let t=0;t<200&&art.filter(a=>a.game==='journey').length<24;t++)await student.waitForTimeout(50);
 const atGate=art.filter(a=>a.phase==='gate'&&a.game==='journey');
 assert.ok(atGate.length>=24,`Journey art requested during the gate (${atGate.length} files)`);
 assert.ok(atGate.every(a=>a.file.endsWith('.webp')),'Journey art is WebP');
 assert.deepEqual([...new Set(art.map(a=>a.game))],['journey'],'Only the chosen game downloads art');
 await enterAnswer(student.locator('#answer'),model.tx(s=>String(s.classes[0].students[0].math.gate.item.answer)));await student.locator('#check-answer').click();await student.locator('.arcade-story').waitFor();
 phase='launch';const before=art.length;await student.locator('#launch').click();await student.locator('.vault-overlay button:not([disabled])').waitFor({timeout:15000});
 await student.waitForTimeout(500);
 assert.equal(art.length,before,'Starting the round requests no second copy of the art');
 assert.deepEqual(errors,[]);
 console.log(`PASS art preload: Journey requested ${atGate.length} WebP art files during the math gate; none on the game list, none for other games, none again at Start.`);
}finally{await browser?.close();server.close();fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exit(1);});
