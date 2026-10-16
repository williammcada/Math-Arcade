// Math Arcade 0.5.0: Math Engine K–Algebra 2 content through the real teacher and student pages.
const {enterAnswer}=require('./answer-input.cjs');
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
 // v0.9.0: course ticks scope browsing and search; K–7 ticked by default.
 assert.ok(await teacher.locator('[data-course="k7"]').isChecked(),'K–7 skills ticked by default');
 await teacher.locator('[data-course="algebra-2-en"]').check();await teacher.locator('#skill-search').fill('two-variable system');
 // v0.11.0 (Engine 0.37.0): the "Enter x; y" system needs two answers, so it is no longer offered to games.
 assert.equal(await teacher.locator('[data-skill="bank:algebra-2-en:node:142"]').count(),0,'multi-answer item not offered');
 await teacher.locator('#skill-search').fill('equation with fractions');
 await teacher.locator('[data-skill="bank:algebra-2-en:node:209"]').check();assert.equal(await teacher.locator('#mode').inputValue(),'targeted','course items switch to Targeted Review');
 await teacher.locator('#skill-search').fill('Properties of operations: identify (all');assert.equal(await teacher.locator('[data-skill="mq-properties"]').count(),0,'unticked extras are not searched');await teacher.locator('#show-elsewhere').click();assert.ok(await teacher.locator('#search-all').isChecked());await teacher.locator('[data-skill="mq-properties"]').check();
 await teacher.locator('#skill-search').fill('Name a polygon by');await teacher.locator('[data-skill="bank:course-87-en:authored:MCADA-18.1"]').check();
 // Lesson, objective and standard search inside 8/7 only.
 await teacher.locator('#search-all').uncheck();for(const k of ['k7','algebra-2-en','extras'])await teacher.locator(`[data-course="${k}"]`).uncheck();await teacher.locator('[data-course="course-87-en"]').check();
 assert.ok(await teacher.locator('#grade-range').isHidden(),'grade range hidden for course-only Targeted Review');
 await teacher.locator('#skill-search').fill('lesson 9');assert.equal(await teacher.locator('#skills label').count(),11,'lesson 9 finds exactly the eleven 8/7 Lesson 9 skills (Engine 0.63.0 adds six 8/7 port items; was five)');assert.equal(await teacher.locator('#skills .skill-group').count(),1);
 await teacher.locator('#skill-search').fill('PS.MAT.G5.NF.9.6');assert.equal(await teacher.locator('[data-skill="bank:course-87-en:authored:MCADA-9.6"]').count(),1,'standard search');
 await teacher.locator('#skill-search').fill('9.6');assert.equal(await teacher.locator('#skills label').count(),1,'objective search');
 await teacher.locator('#skill-search').fill('');await teacher.locator('[data-course="course-87-en"]').uncheck();await teacher.locator('[data-course="intermediate-4-en"]').check();assert.ok(await teacher.locator('#skills label').count()>20,'course browsing lists that course');assert.match(await teacher.locator('#skills .skill-group').first().innerText(),/Intermediate 4 · Lesson 1:/,'course items are grouped by lesson, in teaching order');
 await teacher.locator('[data-course="k7"]').check();assert.ok(await teacher.locator('#grade-range').isVisible(),'grade range returns with K–7 skills');
 assert.match(await teacher.locator('#selected').innerText(),/Algebra 2 · Solve an equation with fractions/);
 await teacher.locator('#preview-math').click();await teacher.locator('#preview details summary').click();const preview=await teacher.locator('#preview').innerText();assert.match(preview,/PREVIEW 1 \/ 3/);
 await teacher.locator('#count').fill('3');await teacher.screenshot({path:'test-results/engine-settings.png',fullPage:true});
 await teacher.locator('#save-math').click();for(let t=0;t<200&&model.tx(s=>s.classes[0].config.selected.length)!==3;t++)await teacher.waitForTimeout(50);
 assert.deepEqual(model.tx(s=>s.classes[0].config.selected).sort(),['bank:algebra-2-en:node:209','bank:course-87-en:authored:MCADA-18.1','mq-properties']);
 await teacher.locator('#open-session').click();await teacher.locator('#qr canvas').waitFor();const code=await teacher.locator('.join-code').innerText();
 await student.goto(base+'/?code='+code);await student.locator('#join-password').fill(model.tx(s=>s.classes[0].session.join.password));await student.locator('#join-name').click();await teacher.getByRole('button',{name:'Admit',exact:true}).click();
 await student.locator('[data-game="coastal"]').click();
 const seen=new Set();
 for(let i=0;i<3;i++){
  await student.locator('#answer').waitFor();const item=model.tx(s=>s.classes[0].students[0].math.gate.item);seen.add(item.skillId);
  assert.ok(item.html,'engine item');const shown=await student.locator('.question').innerText();assert.ok(shown.length>10,shown);
  assert.equal(await student.evaluate(()=>!!document.querySelector('.question').innerHTML.match(/answerText|"answer"/)),false);
  await student.screenshot({path:`test-results/engine-gate-${i}.png`});
  if(item.inputMode==='choice')await student.locator(`[data-key="${item.choices.find(c=>c!==item.answerText)}"]`).click();else await enterAnswer(student.locator('#answer'),item.inputMode==='keypad'?'999999.5':'wrong');await student.locator('#check-answer').click();await student.locator('#feedback').filter({hasText:'Not quite'}).waitFor();
  if(item.inputMode==='choice'){await student.locator(`[data-key="${item.answerText}"]`).click();assert.equal(await student.locator('#answer').inputValue(),item.answerText);}
  else await enterAnswer(student.locator('#answer'),item.answerText);
  const before=model.tx(s=>s.classes[0].students[0].math.gate?.completed??99);await student.locator('#check-answer').click();
  for(let t=0;t<200;t++){const g=model.tx(s=>s.classes[0].students[0].math.gate);if(!g||g.completed>before)break;await student.waitForTimeout(50);}
  if(i<2)await student.locator('.pill').filter({hasText:`${i+1} / 3`}).waitFor({timeout:15000});
 }
 await student.locator('#launch').waitFor();
 assert.ok(seen.size>=2,[...seen].join());
 const events=model.tx(s=>s.classes[0].students[0].math.events.filter(e=>e.type==='answer'));assert.ok(events.some(e=>e.correct)&&events.some(e=>!e.correct));
 assert.deepEqual(errors,[]);console.log('PASS engine browser: course browsing in lesson order, Algebra 2/8/7/extra selection, targeted switch, preview, engine-rendered gate, typed and choice answers, gate completion; no page errors.');
}finally{await browser.close();await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
