import {mountAnswerEntry,currentAnswerEntry} from '/answer-entry.js';
const game=location.pathname.split('/')[1];
async function api(path,body){const r=await fetch('/api/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const v=await r.json();if(!r.ok)throw Error(v.error||'Connection lost.');return v;}
const initial=await api('campaign',{game,action:'load'}),lease=initial.lease;
let revision=initial.revision,storage=Object.assign(Object.create(null),initial.storage),generation=0,confirmed=0,saving=null,paused=false,allowed=true,gatePending=false;
window.arcadeConfig=initial.effective;window.arcadePaused=false;
const request=(action,extra={})=>api('campaign',{game,lease,action,...extra});
const virtual={getItem:k=>Object.hasOwn(storage,k)?storage[k]:null,setItem:(k,v)=>{storage[String(k)]=String(v);generation++;},removeItem:k=>{delete storage[k];generation++;},clear:()=>{storage=Object.create(null);generation++;},key:i=>Object.keys(storage)[i]??null,get length(){return Object.keys(storage).length;}};
Object.defineProperty(window,'localStorage',{value:virtual});
// Math Civ already has a supported localStorage fallback; use it so every saved byte is scoped to this student.
if(game==='math-civ')Object.defineProperty(window,'indexedDB',{get(){throw Error('Use classroom storage.');}});
window.arcadeFlush=async()=>{if(saving){await saving;if(confirmed===generation)return;}saving=(async()=>{while(confirmed<generation){const version=generation,reply=await request('save',{revision,storage:{...storage}});revision=reply.revision;confirmed=version;}})();try{await saving;}finally{saving=null;}};
const style=document.createElement('link');style.rel='stylesheet';style.href='/campaign-runtime.css';document.head.append(style);
const blocker=document.createElement('dialog');blocker.className='classroom-blocker';blocker.hidden=true;blocker.innerHTML='<div><h2 data-message></h2><button data-resume>Resume adventure</button></div>';document.body.append(blocker);
blocker.addEventListener('cancel',e=>e.preventDefault());
for(const type of ['keydown','keyup','pointerdown','pointermove','pointerup','click'])window.addEventListener(type,e=>{if(paused&&!blocker.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();}},true);
const contexts=[];if(window.AudioContext){const Original=window.AudioContext;window.AudioContext=class extends Original{constructor(...args){super(...args);contexts.push(this);}resume(){return paused?Promise.resolve():super.resume();}};}
function block(message){if(!paused){paused=true;window.arcadePaused=true;window.arcadePause?.(true);for(const context of contexts)void context.suspend();speechSynthesis?.cancel();}blocker.hidden=false;if(!blocker.open)blocker.showModal();blocker.querySelector('[data-message]').textContent=message;blocker.querySelector('button').hidden=!allowed;}
blocker.querySelector('button').onclick=()=>{if(!allowed)return;paused=false;window.arcadePaused=false;blocker.hidden=true;blocker.close();window.arcadePause?.(false);for(const context of contexts)void context.resume();};
// v0.8.0 iPad sound: playback audio session (side switch no longer mutes), and every tap/click/key resumes
// suspended audio and retries music that iOS refused to start outside a gesture.
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}
const blockedMusic=new Set(),nativePlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){const p=nativePlay.apply(this,args);p?.catch?.(()=>{if(this.loop)blockedMusic.add(this);});return p;};
const wakeAudio=()=>{if(paused)return;try{if(navigator.audioSession&&navigator.audioSession.type!=='playback')navigator.audioSession.type='playback';}catch{}for(const c of contexts)if(c.state==='suspended')void c.resume();for(const m of blockedMusic){blockedMusic.delete(m);if(m.paused)void nativePlay.call(m).catch(()=>{});}};
for(const type of ['touchend','pointerup','click','keydown'])document.addEventListener(type,wakeAudio,{capture:true,passive:true});
const nativeSetInterval=window.setInterval;
nativeSetInterval(async()=>{try{const v=await request('poll');allowed=v.playing;window.arcadeConfig=v.effective;window.arcadeAssignment?.(v.effective);if(!allowed)block(v.status==='ended'?'Your classroom session has ended.':'Your teacher has paused or closed this adventure.');else if(paused){blocker.querySelector('[data-message]').textContent='Ready when you are.';blocker.querySelector('button').hidden=false;}await window.arcadeFlush();}catch(e){allowed=false;block(e.message);}},800);
window.addEventListener('blur',()=>block('Adventure paused.'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)block('Adventure paused.');});
window.addEventListener('contextmenu',e=>{e.preventDefault();block('Adventure paused.');});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.arcadeGate=async(key,{onCorrect=()=>{}}={})=>{
 if(gatePending)throw Error('A gate is already open.');gatePending=true;
 const panel=document.createElement('section');panel.className='classroom-gate';document.body.append(panel);
 let state,count,draft='',busy=false,resolveGate,rejectGate;
 const promise=new Promise((resolve,reject)=>{resolveGate=resolve;rejectGate=reject;});
 const finish=()=>{currentAnswerEntry()?.destroy();panel.remove();gatePending=false;resolveGate({count});};
 function draw(){const g=state.gate;panel.innerHTML=`<div class="cg-shell"><div class="cg-head"><div><p class="cg-eyebrow">Adventure gate</p><h2>Math gate</h2></div><span class="cg-pill">${g.completed} / ${g.count} completed</span></div><div class="cg-progress"><span style="width:${g.count?g.completed/g.count*100:0}%"></span></div><section class="cg-card"><div class="cg-layout"><div><p class="cg-eyebrow">${esc(g.skillName)}</p><div class="cg-question">${g.html}</div><p class="cg-muted">Your adventure is saved. Take your time. Fractions should be reduced.</p><p data-feedback class="cg-feedback" role="status"></p></div><form><label>Your answer<input class="cg-answer" aria-label="Your answer" autocomplete="off"></label><div class="cg-keypad"></div><button data-submit class="cg-primary">Check answer <span aria-hidden="true">→</span></button></form></div></section></div>`;
  const input=panel.querySelector('input');const persistDraft=()=>{draft=input.value.slice(0,150);void request('draft',{itemId:g.itemId,draft}).catch(()=>{});};input.oninput=persistDraft;
  mountAnswerEntry({container:panel.querySelector('.cg-keypad'),input,form:panel.querySelector('form'),gate:g,choiceClass:'cg-keypad',value:draft}); // U-18 universal answer pad
  panel.querySelector('form').onsubmit=async e=>{e.preventDefault();if(busy||paused||!input.value.trim())return;busy=true;panel.querySelector('[data-submit]').disabled=true;try{const v=await api('answer',{itemId:g.itemId,commandId:crypto.randomUUID(),answer:input.value});state=v.state;if(v.result.correct){draft='';onCorrect({...v.result,skillId:g.skillId,skillName:g.skillName,attempts:g.attempts+1});await window.arcadeFlush();if(v.result.complete){finish();return;}draw();}else panel.querySelector('[data-feedback]').textContent='Not quite. Try again. Fractions should be reduced.';}catch(e){panel.querySelector('[data-feedback]').textContent=e.message;}finally{busy=false;const b=panel.querySelector('[data-submit]');if(b)b.disabled=false;}};
 }
 try{await window.arcadeFlush();const reply=await request('gate',{key});count=reply.count;if(reply.complete){finish();return promise;}state=reply.state;draft=reply.draft||'';draw();}catch(e){panel.innerHTML='<p>'+esc(e.message)+'</p>';gatePending=false;rejectGate(e);}return promise;
};
await import('./game.js');
