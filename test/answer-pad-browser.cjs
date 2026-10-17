// Math Arcade v0.10.0 (handbook U-18): the universal answer pad in the student gate, on an iPad-size touch page.
// Four students, one answer form each. Every answer is entered only by tapping pad keys (switching tabs as a
// student would): a remainder (the classroom failure), a fraction, a negative decimal and an inequality.
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
const padModule={exports:{}};new Function('module','exports',fs.readFileSync(path.join(__dirname,'../vendor/math/answer-pad.js'),'utf8'))(padModule,padModule.exports);
const PAD=padModule.exports;
// The expected layout comes from the pinned Engine pad itself (U-18; the Engine owns the layout, amended 2026-10-16),
// so a deliberate Engine update with a new layout does not need this test rewritten.
const label=k=>PAD.labelFor(k);
const TAB123=PAD.tabs.find(t=>t.id==='123').rows.flat().map(label);
const TABALG=PAD.tabs.find(t=>t.id==='algebra').rows.flat().map(label);
(async()=>{const {createApp}=await import('../server/index.mjs');const {freshMath}=await import('../build/math/engine.js');
const dir=fs.mkdtempSync(os.tmpdir()+'/arcade-answer-pad-');const {server,model}=createApp({dbPath:dir+'/db',password:'test-password-only'});let browser;
await new Promise(r=>server.listen(0,'127.0.0.1',r));const shots=process.env.SHOT_DIR||'test-results';fs.mkdirSync(shots,{recursive:true});
const cases=[['Ana','g4-div-2by1-remainder','remainder'],['Ben','g3-unitfraction','fraction'],['Cy','g7-decimal','negative decimal'],['Dee','g7-inequality','inequality']];
try{
 const base='http://127.0.0.1:'+server.address().port;
 const code=model.tx(s=>{const t=model.login(s,'test-password-only'),cid=model.classCreate(s,t,{name:'Pad Lab'});model.roster(s,t,cid,cases.map(c=>c[0]));
  for(const [i,[,skill]] of cases.entries())model.assign(s,t,cid,{studentId:s.classes[0].students[i].id,config:{...freshMath().config,mode:'targeted',lo:0,hi:7,selected:[skill],count:2}});
  model.session(s,t,cid,'open');return s.classes[0].session.code;});
 const gateOf=i=>model.tx(s=>s.classes[0].students[i].math.gate);
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const errors=[];
 const teacher=await (await browser.newContext({viewport:{width:1440,height:1000}})).newPage();teacher.on('pageerror',e=>errors.push(e.message));
 await teacher.goto(base+'/?role=teacher');await teacher.locator('#password').fill('test-password-only');await teacher.getByRole('button',{name:'Sign in',exact:true}).click();
 const results=[];
 for(const [i,[name,skill,form]] of cases.entries()){
  const page=await (await browser.newContext({viewport:i%2?{width:768,height:1024}:{width:1024,height:768},hasTouch:true,isMobile:true})).newPage();page.on('pageerror',e=>errors.push(name+': '+e.message));
  await page.goto(base+'/?code='+code);await page.locator('#student-name').waitFor();await page.locator('#student-name').selectOption({label:name});
  await page.locator('#join-password').fill(model.tx(s=>s.classes[0].session.join.password));await page.locator('#join-name').click();
  await teacher.getByRole('button',{name:'Admit',exact:true}).first().click();
  await page.locator('[data-game="coastal"]').click();await page.locator('#answer').waitFor();
  const tapKey=async key=>{const want=key===' '?' ':key;let btn=page.locator(`.answer-pad-grid:not([hidden]) [data-pad-key="${want}"]`);
   if(!await btn.count()){await page.locator(`[data-pad-tab="${TAB123.includes(want===' '?'Space':want)?'123':'algebra'}"]`).tap();btn=page.locator(`.answer-pad-grid:not([hidden]) [data-pad-key="${want}"]`);}
   await btn.tap();};
  for(let q=0;q<2;q++){
   const g=gateOf(i);assert.equal(g.item.skillId,skill);assert.equal(g.item.inputMode,'keypad',name+' question uses the pad');
   // U-18: same two tabs and keys on every question; 123 opens first.
   assert.equal(await page.locator('[data-pad-tab="123"]').getAttribute('aria-selected'),'true',name+' q'+(q+1)+' opens on 123');
   assert.deepEqual(await page.locator('[data-pad-panel="123"] .answer-pad-key').allInnerTexts(),TAB123);
   assert.deepEqual(await page.locator('[data-pad-panel="algebra"] .answer-pad-key').evaluateAll(els=>els.map(e=>e.textContent)),TABALG);
   assert.equal(await page.locator('#answer').evaluate(e=>e.readOnly+' '+e.inputMode),'true none','iPad keyboard stays closed');
   const typed=PAD.padForm(g.item.answerText).replace(/-/g,'−');
   for(const ch of typed)await tapKey(ch);
   assert.equal((await page.locator('#answer').inputValue()).replace(/−/g,'-'),PAD.padForm(g.item.answerText).replace(/−/g,'-'),name+' taps produce the answer');
   if(q===0)await page.screenshot({path:`${shots}/answer-pad-${form.replace(/ /g,'-')}.png`});
   const before=g.completed;
   if(q===0){await page.locator('[data-pad-tab="algebra"]').tap();await page.keyboard.press('Enter');} // Enter from a physical keyboard submits
   else await page.locator('#check-answer').tap();
   for(let t=0;t<200;t++){const n=gateOf(i);if(!n||n.completed>before)break;await page.waitForTimeout(50);}
   const after=gateOf(i);assert.ok(!after||after.completed>before,name+' answer accepted');results.push(`${name} ${form}: "${typed}" accepted`);
   if(q===0)await page.locator('.pill').filter({hasText:'1 / 2'}).waitFor({timeout:15000});
  }
  await page.locator('#launch').waitFor();await page.context().close();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS answer-pad-browser: '+results.join('; '));
}catch(e){console.error(e);process.exitCode=1;}finally{await browser?.close();server.close();}})();
