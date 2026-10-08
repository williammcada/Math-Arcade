const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os');
(async()=>{
 const {createApp}=await import('../server/index.mjs');
 const dir=fs.mkdtempSync(os.tmpdir()+'/arcade-civ-browser-'),{server,model}=createApp({dbPath:dir+'/db',password:'test-password-only'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  const base='http://127.0.0.1:'+server.address().port;let teacher,cid;
  const token=model.tx(s=>{teacher=model.login(s,'test-password-only');cid=model.classCreate(s,teacher,{name:'Lab'});model.roster(s,teacher,cid,['Tim']);model.session(s,teacher,cid,'open');const u=model.join(s,{code:s.classes[0].session.code,password:s.classes[0].session.join.password,studentId:s.classes[0].students[0].id});model.approve(s,teacher,s.tokens.at(-1).id,true);return u;});
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/tmp/chromium',args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1180,height:820},hasTouch:true});await context.addCookies([{name:'student',value:token,url:base}]);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('[data-game="math-civ"]').click();
  let frame=page.frameLocator('iframe');
  await frame.locator('[data-action=new]').click();await frame.locator('[data-action=start]').click();
  await frame.locator('.arcade-story').waitFor();await frame.locator('.arcade-directions').waitFor();
  fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/math-civ-prologue.png'});
  await frame.locator('[data-action=advance]').click();await frame.locator('[data-action=advance]').click();await frame.locator('[data-action=advance]').click();
  await frame.locator('[data-action^="policy:"]').first().click();await frame.locator('[data-action^="detail:"]').first().click();await frame.locator('[data-action^="open:"]').click();
  const operands=await frame.locator('body').evaluate(()=>window.arcadeCiv.state.activeOrder.operands);
  for(const input of await frame.locator('[data-answer]').all())await input.fill('0');
  await frame.locator('[data-action=answer]').click();
  assert.equal(await frame.locator('body').evaluate(()=>window.arcadeCiv.state.activeOrder.attempts),1);
  // Independently calculate the authored allocation question, preserving the second-attempt consequence.
  const sum=operands.ratio.reduce((a,b)=>a+b,0),fields=['farms','workshops','works'];
  for(let i=0;i<fields.length;i++)await frame.locator(`[data-answer=${fields[i]}]`).fill(String(operands.total*operands.ratio[i]/sum));
  await frame.locator('[data-action=answer]').click();
  const snapshot=await frame.locator('body').evaluate(()=>structuredClone(window.arcadeCiv.state));assert.equal(snapshot.challengeRecords.at(-1).path,'attempt2');
  assert.equal(await frame.locator('.classroom-gate').count(),0);
  model.tx(s=>model.session(s,teacher,cid,'pause'));await frame.locator('.classroom-blocker').waitFor({state:'visible'});
  assert.equal(await frame.locator('body').evaluate(()=>{const a=window.arcadeCiv,b=JSON.stringify(a.state);a.dispatch({type:'ADVANCE'});return b===JSON.stringify(a.state)&&a.aiTimer===null;}),true);
  model.tx(s=>model.session(s,teacher,cid,'resume'));await frame.getByRole('button',{name:'Resume adventure'}).click();
  await page.locator('[data-back]').click();await page.locator('[data-game="math-civ"]').click();frame=page.frameLocator('iframe');await frame.locator('[data-action=continue]').click();
  assert.deepEqual(await frame.locator('body').evaluate(()=>window.arcadeCiv.state),snapshot);
  assert.equal(model.tx(s=>s.classes[0].students[0].math.events.length),0);
  // Lease replacement blocks the old tab before it can overwrite the new one.
  const second=await context.newPage();second.on('pageerror',e=>errors.push(e.message));await second.goto(base);const next=second.frameLocator('iframe');await next.locator('[data-action=continue]').click();
  await frame.locator('.classroom-blocker').waitFor({state:'visible'});assert.match(await frame.locator('.classroom-blocker').innerText(),/another tab/);await page.close();
  await next.locator('[data-action=saves]').click();await next.locator('[data-action=arcade-clear-campaigns]').click();await next.locator('#no').click();assert.equal(await next.locator('body').evaluate(()=>Object.keys(window.arcadeCiv.slots).length),1);
  await next.locator('[data-action=arcade-clear-campaigns]').click();await next.locator('#yes').click();await next.getByText('Math Civ campaigns deleted.',{exact:true}).waitFor();
  await second.locator('[data-back]').click();await second.locator('[data-game="math-civ"]').click();assert.equal(await next.locator('[data-action=continue]').isDisabled(),true);
  await next.locator('[data-action=new]').click();await next.locator('[data-action=start]').click();await next.locator('.arcade-story').waitFor();
  // A real loss of connectivity is fail-closed; reconnection still needs explicit Resume.
  await second.route('**/api/campaign',route=>route.abort());await next.locator('.classroom-blocker').waitFor({state:'visible'});assert.equal(await next.getByRole('button',{name:'Resume adventure'}).isVisible(),false);await second.unroute('**/api/campaign');await next.getByRole('button',{name:'Resume adventure'}).click();
  model.tx(s=>model.availability(s,teacher,cid,['chrono']));await next.locator('.classroom-blocker').waitFor({state:'visible'});assert.equal(await next.getByRole('button',{name:'Resume adventure'}).isVisible(),false);
  model.tx(s=>model.session(s,teacher,cid,'end'));await second.locator('iframe').waitFor({state:'detached'});
  assert.deepEqual(errors,[]);console.log('PASS Math Civ: authored calculation, no synthetic gates, save/reload, pause, stale tab, deletion/cancel, fresh campaign, connection loss, availability and session end.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
