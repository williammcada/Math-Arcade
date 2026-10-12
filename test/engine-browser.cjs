// Math Arcade 0.5.0: Math Engine K–Algebra 2 content through the real teacher and student pages.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');
(async()=>{const {createApp}=await import('../server/index.mjs');const dir=fs.mkdtempSync(os.tmpdir()+'/arcade-engine-browser-');const {server,model}=createApp({dbPath:dir+'/db',password:'test-password-only'});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const errors=[];
try{fs.mkdirSync('test-results',{recursive:true});
 const teacher=await browser.newPage({viewport:{width:1440,height:1000}}),student=await browser.newPage({viewport:{width:1180,height:820},hasTouch:true});
 for(const page of [teacher,student])page.on('pageerror',e=>errors.push(e.message));
 await teacher.goto(base+'/?role=teacher');await teacher.locator('#password').fill('test-password-only');await teacher.getByRole('button',{name:'Sign in',exact:true}).click();
 teacher.once('dialog',d=>d.accept('Engine Lab'));await teacher.locator('#new-class').click();await teacher.locator('#add-students').click();await teacher.locator('#names').fill('Ana');await teacher.locator('#save-names').click();
 // Teacher picks course items (Grade 3 → Algebra 2) and an extra alongside a K–7 skill.
 await teacher.locator('#class-math').click();await teacher.locator('#clear-selected').click();
 await teacher.locator('#course').selectOption('algebra-2-en');await teacher.locator('#skill-search').fill('two-variable system');
 await teacher.locator('[data-skill="bank:algebra-2-en:node:142"]').check();assert.equal(await teacher.locator('#mode').inputValue(),'targeted','course items switch to Targeted Review');
 await teacher.locator('#skill-search').fill('Properties of operations: identify (all');await teacher.locator('[data-skill="mq-properties"]').check();
 await teacher.locator('#skill-search').fill('Name a polygon by');await teacher.locator('[data-skill="bank:course-87-en:authored:MCADA-18.1"]').check();
 await teacher.locator('#skill-search').fill('');await teacher.locator('#course').selectOption('intermediate-4-en');assert.ok(await teacher.locator('#skills label').count()>20,'course browsing lists that course');
 assert.match(await teacher.locator('#selected').innerText(),/Algebra 2 · Solve a two-variable system/);
 await teacher.locator('#preview-math').click();await teacher.locator('#preview details summary').click();const preview=await teacher.locator('#preview').innerText();assert.match(preview,/PREVIEW 1 \/ 3/);
 await teacher.locator('#count').fill('3');await teacher.screenshot({path:'test-results/engine-settings.png',fullPage:true});
 await teacher.locator('#save-math').click();await teacher.waitForTimeout(400);
 assert.deepEqual(model.tx(s=>s.classes[0].config.selected).sort(),['bank:algebra-2-en:node:142','bank:course-87-en:authored:MCADA-18.1','mq-properties']);
 await teacher.locator('#open-session').click();await teacher.locator('#qr canvas').waitFor();const code=await teacher.locator('.join-code').innerText();
 await student.goto(base+'/?code='+code);await student.getByRole('button',{name:'Join class →'}).click();await student.locator('#join-password').fill(model.tx(s=>s.classes[0].session.join.password));await student.locator('#join-name').click();await teacher.getByRole('button',{name:'Admit',exact:true}).click();
 await student.locator('[data-game="coastal"]').click();
 const seen=new Set();
 for(let i=0;i<3;i++){
  await student.locator('#answer').waitFor();const item=model.tx(s=>s.classes[0].students[0].math.gate.item);seen.add(item.skillId);
  assert.ok(item.html,'engine item');const shown=await student.locator('.question').innerText();assert.ok(shown.length>10,shown);
  assert.equal(await student.evaluate(()=>!!document.querySelector('.question').innerHTML.match(/answerText|"answer"/)),false);
  await student.screenshot({path:`test-results/engine-gate-${i}.png`});
  await student.locator('#answer').fill('wrong');await student.locator('#check-answer').click();await student.locator('#feedback').filter({hasText:'Not quite'}).waitFor();
  if(item.inputMode==='choice'){await student.locator('#answer').fill('');await student.locator(`[data-key="${item.answerText}"]`).click();assert.equal(await student.locator('#answer').inputValue(),item.answerText);}
  else await student.locator('#answer').fill(item.answerText);
  await student.locator('#check-answer').click();await student.waitForTimeout(700);
 }
 await student.locator('#launch').waitFor();
 assert.ok(seen.size>=2,[...seen].join());
 const events=model.tx(s=>s.classes[0].students[0].math.events.filter(e=>e.type==='answer'));assert.ok(events.some(e=>e.correct)&&events.some(e=>!e.correct));
 assert.deepEqual(errors,[]);console.log('PASS engine browser: course browsing, Algebra 2/8/7/extra selection, targeted switch, preview, engine-rendered gate, typed and choice answers, gate completion; no page errors.');
}finally{await browser.close();await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
