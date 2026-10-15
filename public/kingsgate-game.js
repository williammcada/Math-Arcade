// Math Arcade host for Kingsgate (game source: williammcada/mathquest public/games/kingsgate).
// The device runs the defense. Before waves 2–12 the round pauses for a question round;
// the server generates and checks every question with the Math Engine and credits gold.
import {outgoing,keepLocal} from '/round-sync.js';
import {kingsgateAdapter} from '/kingsgate/games/kingsgate/adapter.js';
import {resolveBreak} from '/kingsgate/games/kingsgate/sim.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const KINGSGATE_STORY='Orc warbands of the Ashmoor are marching on Kingsgate, the walled city that guards the kingdom. Twelve waves are coming down the pass; the last brings a Siege Ram.';
export const KINGSGATE_TASK='Tap a gold ring to build a tower; tap a tower to upgrade or sell it. Before each new wave you answer questions: every correct first answer earns 30 gold. Kill Shamans first and save gold for the Siege Ram. Five active minutes; pauses and question rounds stop the clock.';
export function kingsgatePreparation(){return `<section class="card narrow"><span class="pill live">READY</span><h1>Kingsgate</h1><section class="arcade-story"><h2>Story</h2><p>${KINGSGATE_STORY}</p></section><section class="arcade-directions"><h2>Your task</h2><p>${KINGSGATE_TASK}</p><p>The questions come between waves. Leaving Kingsgate early means a math gate before your next Kingsgate.</p></section><button id="launch" class="primary">Start Kingsgate</button></section>`;}
export class KingsgateGame{
 constructor(root,state,api,onClose){
  Object.assign(this,{root,state,api,onClose,game:'kingsgate',round:state.activity.round,seq:state.activity.round.seq,paused:true,connected:true,last:performance.now(),acc:0});
  this.adapter=kingsgateAdapter;this.sim=structuredClone(this.round.snapshot);this.abort=new AbortController();this.audio=this.adapter.createAudio();
  root.hidden=false;root.className='flight-root vault-root extra-root';
  root.innerHTML=`<div class="row between"><strong>Kingsgate</strong><div class="row"><button data-sound>Sound on</button><button data-exit>Leave round</button></div></div><div class="vault-body"><div class="vault-stage" style="touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none"><canvas width="640" height="360" aria-label="${this.adapter.canvasLabel}"></canvas></div><section class="vault-scenes" hidden><h2>Guided defense</h2><p data-guided></p><button data-next>Continue the guided defense</button></section><section class="kg-break card" hidden style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,94%);max-height:94%;overflow:auto;z-index:6;box-sizing:border-box;color:#152230;background:#fff"></section><div class="vault-overlay"></div></div><div><p data-hud class="flight-status"></p><p data-objective class="flight-status"></p><div class="row between"><div class="row"><button data-help>Help</button><button data-assist>Guided defense</button></div><button data-pause>Resume</button></div></div>`;
  const get=s=>root.querySelector(s);this.canvas=get('canvas');this.ctx=this.canvas.getContext('2d');
  this.canvas.addEventListener('pointerdown',e=>{if(this.blocked()||this.sim.arcadeMode!=='action')return;e.preventDefault();const r=this.canvas.getBoundingClientRect();if(!r.width||!r.height)return;const k=Math.min(r.width/640,r.height/360),ox=(r.width-640*k)/2,oy=(r.height-360*k)/2;/* canvas uses object-fit: contain; map through the letterboxed content box */this.adapter.pointer(this.sim,(e.clientX-r.left-ox)/k,(e.clientY-r.top-oy)/k);for(const ev of this.sim.events)this.audio.effect(ev.type);this.sim.events=[];},{signal:this.abort.signal});
  get('[data-pause]').onclick=()=>this.paused?this.resume():this.pause();get('[data-help]').onclick=()=>{this.help=true;this.pause();};
  get('[data-assist]').onclick=()=>{this.pause();if(confirm('Switch to the guided defense? It is recorded separately from a defense result.'))this.command('assist');};
  get('[data-next]').onclick=()=>this.command('safe');
  get('[data-sound]').onclick=async()=>{try{await this.audio.toggle();}catch{try{await this.audio.start?.();}catch{}}get('[data-sound]').textContent=this.audio.enabled?'Sound on':'Sound off';};
  get('[data-exit]').onclick=async()=>{this.pause();if(confirm('Leave this round?')){try{await api('leave',{});this.destroy();}catch(e){this.error=e.message;this.paint();}}};
  const opts={signal:this.abort.signal};for(const event of ['blur','pagehide'])window.addEventListener(event,()=>this.pause(),opts);document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();},opts);
  for(const event of ['contextmenu','selectstart','dragstart'])get('.vault-stage').addEventListener(event,e=>e.preventDefault(),opts);
  this.sync('pause');this.adapter.loadArt().then(art=>{if(!this.dead){this.art=art;this.paint();}}).catch(()=>{this.error='Artwork could not load. Reload to recover this round.';this.paint();});
  if(state.gate)this.showQuestion(state.gate);
  this.paint();this.timer=setInterval(()=>this.sync(),140);this.frame=requestAnimationFrame(t=>this.tick(t));
 }
 blocked(){return this.paused||!this.connected||!this.art||this.state.status!=='open'||document.hidden||!!this.sim.outcome||!!this.breakOpen;}
 apply(next,action){if(this.dead)return;this.state=next;if(next.status==='ended'){this.destroy();return;}const keep=keepLocal(this,next,action);this.round=next.activity.round;if(!keep&&!this.breakOpen&&!this.keepOnce)this.sim=structuredClone(this.round.snapshot);this.keepOnce=false;if(!this.round.running||next.status!=='open'||this.sim.outcome){this.paused=true;this.audio.pause(true);}else if(action==='resume'&&!document.hidden){this.paused=false;this.last=performance.now();this.acc=0;this.audio.pause(false);}this.paint();}
 async sync(action){if(this.dead||this.breakOpen)return;if(this.sending||this.commanding){if(action)this.pending=action;return;}const requested=action||this.pending;this.pending=null;this.sending=true;this.syncPromise=(async()=>{try{const next=await this.api('sync',{roundId:this.round.id,seq:++this.seq,keys:{},snapshot:outgoing(this,requested),action:requested});this.connected=true;this.error='';this.apply(next,requested);}catch(e){this.connected=false;this.paused=true;this.audio.pause(true);this.error=e.message;this.paint();}finally{this.sending=false;}})();await this.syncPromise;}
 async command(action){if(this.commanding||this.dead)return;this.commanding=true;try{await this.syncPromise;this.pending=null;this.apply(await this.api('sync',{roundId:this.round.id,seq:++this.seq,keys:{},action:'resume'}),'resume');this.apply(await this.api('extra',{roundId:this.round.id,commandId:crypto.randomUUID(),action,objective:String(this.sim.guideStep)}));}catch(e){this.error=e.message;this.paint();}finally{this.commanding=false;}}
 pause(){if(this.dead)return;this.paused=true;this.audio.pause(true);this.sync('pause');this.paint();}
 async resume(){if(!this.art||this.state.status!=='open'||this.breakOpen)return;this.help=false;this.error='';await this.sync('resume');if(!this.blocked())await this.audio.start();this.paint();}
 // Question round between waves.
 async openBreak(){
  if(this.breakOpen)return;this.breakOpen={wave:this.sim.g.breakFor,answered:0,correct:0};this.audio.pause(true);
  try{await this.syncPromise;const out=await this.api('kingsgate',{roundId:this.round.id,commandId:crypto.randomUUID(),action:'break',snapshot:{...this.sim,events:[]}});this.state=out.state;this.round=out.state.activity.round;if(out.devBreak){await this.finishBreak(out.devBreak);return;}if(out.state.gate)this.showQuestion(out.state.gate);else throw Error('The question round could not open.');}
  catch(e){this.breakOpen=null;this.paused=true;this.error=e.message;this.paint();}
 }
 showQuestion(g){
  this.breakOpen||={wave:this.sim.g.breakFor,answered:0,correct:0};this.question=g;const panel=this.root.querySelector('.kg-break');panel.hidden=false;
  const keys=g.inputMode==='keyboard'?[]:g.inputMode==='choice'?(g.choices||[]):(g.keys||['7','8','9','back','4','5','6','clear','1','2','3','-','0','.','/',' ']);
  panel.innerHTML=`<p class="eyebrow">Before wave ${this.breakOpen.wave+1} · ${esc(g.skillName||'')}</p><h2>Question round</h2><p class="muted">Each correct first answer earns 30 gold. One try per question.</p><div class="question">${g.html}</div><form><label>Your answer<input class="answer" autocomplete="off" inputmode="${g.inputMode==='keyboard'?'text':'none'}" aria-label="Your answer"></label><div class="keypad">${keys.map(k=>`<button type="button" data-key="${esc(k)}">${esc(k==='back'?'⌫':k==='clear'?'Clear':k===' '?'Space':k)}</button>`).join('')}</div><p class="feedback" role="status"></p><button class="primary" style="width:100%;margin-top:12px">Check answer</button></form>`;
  const input=panel.querySelector('input'),form=panel.querySelector('form');
  panel.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{const k=b.dataset.key;input.value=g.inputMode==='choice'?k:k==='clear'?'':k==='back'?input.value.slice(0,-1):input.value+k;});
  form.onsubmit=async e=>{e.preventDefault();if(this.answering||!input.value.trim())return;this.answering=true;const button=form.querySelector('button.primary');button.disabled=true;
   try{const out=await this.api('kingsgate',{roundId:this.round.id,commandId:crypto.randomUUID(),action:'answer',itemId:g.itemId,answer:input.value});const r=out.result;this.state=out.state;
    const fb=panel.querySelector('.feedback');fb.textContent=r.correct?'Correct! +30 gold':'Not quite. The answer is '+(r.answerText??'shown by your teacher')+'.';this.audio.effect(r.correct?'gold':'kill');
    button.textContent=r.complete?'Back to the walls':'Next question';button.disabled=false;form.onsubmit=ev=>{ev.preventDefault();if(r.complete)this.finishBreak(r.breakResult);else this.showQuestion(out.state.gate);};}
   catch(err){panel.querySelector('.feedback').textContent=err.message;button.disabled=false;}finally{this.answering=false;}};
 }
 async finishBreak(result){
  resolveBreak(this.sim.g,{answered:result.answered,correct:result.correct});this.root.querySelector('.kg-break').hidden=true;this.breakOpen=null;this.question=null;
  this.keepOnce=true;this.sentAt=0;await this.resume();this.sentAt=0;this.sync();
 }
 paint(){if(this.dead)return;const s=this.sim,get=x=>this.root.querySelector(x),guided=s.arcadeMode==='accessible';get('[data-pause]').textContent=this.paused?'Resume':'Pause';get('.vault-stage').hidden=guided;get('.vault-scenes').hidden=!guided;
  const message=this.breakOpen?'':this.help?'Help':!this.connected?'Connection lost. Reconnecting…':this.state.status==='paused'?'Your teacher has paused the class.':s.outcome?(this.adapter.resultLabels[s.outcome]||'Round complete'):!this.art?'Loading artwork…':this.paused?'Ready to defend?':'';
  const overlay=get('.vault-overlay');overlay.hidden=!message&&!this.error;const signature=message+'|'+this.error;
  if(signature!==this.overlayKey){this.overlayKey=signature;overlay.innerHTML='<section class="card"><h2></h2><section class="arcade-directions"><h3>Instructions</h3><p></p></section><p class="vault-error" role="status"></p><button class="primary"></button></section>';overlay.querySelector('h2').textContent=message;overlay.querySelector('section p').textContent=s.outcome?'Start Kingsgate again from the arcade for a new round.':KINGSGATE_TASK;overlay.querySelector('[role=status]').textContent=this.error||'';const b=overlay.querySelector('button');b.textContent=s.outcome?'Back to arcade':'Resume';b.disabled=!s.outcome&&(!this.connected||!this.art||this.state.status!=='open');b.onclick=()=>s.outcome?this.destroy():this.resume();}
  if(guided)get('[data-guided]').textContent=['Captain Aldren posts archers above the road.','Engineers wheel the ballistae into place.','Every bell rings as the first warband reaches the river.','The defenders hold the bridge through the night.','At dawn the Siege Ram reaches the last stretch of road.','The gate holds.'][s.guideStep]||'Guided defense complete.';
 }
 tick(now){if(this.dead)return;const dt=(now-this.last)/1000;this.last=now;
  if(!this.blocked()&&this.sim.arcadeMode==='action'){if(dt>.2)this.pause();else{this.acc+=dt;while(this.acc>=1/60&&!this.sim.outcome&&this.sim.g.mode!=='break'){this.adapter.step(this.sim,{},1/60);this.acc-=1/60;for(const e of this.sim.events||[])this.audio.effect(e.type);}this.audio.update(this.sim);if(this.sim.g.mode==='break')this.openBreak();if(this.sim.outcome)this.sync('pause');}}else this.acc=0;
  if(this.art&&this.sim.arcadeMode==='action'){const r=this.canvas.getBoundingClientRect(),k=Math.min(3,Math.max(1,(r.width||640)/640*(devicePixelRatio||1))),w=Math.round(640*k),h=Math.round(360*k);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.ctx.setTransform(w/640,0,0,h/360,0,0);this.adapter.render(this.ctx,this.sim,this.art);}
  {const h=this.root.querySelector('[data-hud]'),o=this.root.querySelector('[data-objective]');h.textContent=this.adapter.hud(this.sim);o.textContent=this.adapter.objective(this.sim)+(this.sim.message&&this.sim.time-this.sim.messageAt<4?' · '+this.sim.message:'');}
  this.frame=requestAnimationFrame(t=>this.tick(t));
 }
 destroy(){if(this.dead)return;this.dead=true;clearInterval(this.timer);cancelAnimationFrame(this.frame);this.abort.abort();this.audio.destroy();this.root.hidden=true;this.root.innerHTML='';this.onClose();}
}
