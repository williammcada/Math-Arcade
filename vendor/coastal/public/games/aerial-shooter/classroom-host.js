import {ActionHost} from '../../engine/action-host.js';
import {aerialAdapter} from './adapter.js';
import {restore} from './core.js';
import {registerRecord} from '../../privacy.js';
export class CoastalHost {
 constructor(root,{run,send,paused,deadline,serverNow}){
  this.root=root;this.run=run;this.send=send;this.teacherPaused=paused;this.deadline=deadline;this.offset=(serverNow||Date.now())-Date.now();this.seq=run.seq;this.key=`mq-coastal-flight-${run.runId}`;this.lastContact=Date.now();this.pending=null;this.sending=false;
  try{registerRecord(new URLSearchParams(location.search).get('session'),this.key);}catch{}
  this.css=document.createElement('link');this.css.rel='stylesheet';this.css.href=new URL('./practice.css',import.meta.url).href;document.head.append(this.css);
  root.classList.add('coastal-live-flight');root.style.cssText='position:fixed;inset:0;z-index:40;background:#07121e';
  let snap=run.snapshot;
  try{const saved=JSON.parse(localStorage.getItem(this.key)||'null');if(saved&&saved.seq>=run.seq&&run.status!=='terminal'){snap=restore(run.config,saved.snapshot);this.seq=saved.seq;}}catch{}
  this.host=new ActionHost(root,{adapter:aerialAdapter,config:run.config,snapshot:snap,onSave:s=>this.save(s)});
  const h=this.host,baseStart=h.start.bind(h),baseResume=h.resume.bind(h),baseBlocked=h.blocked.bind(h),baseOverlay=h.overlay.bind(h);
  h.blocked=()=>this.teacherPaused||this.offline||baseBlocked();
  h.start=async()=>{if(this.teacherPaused||this.starting||this.dead||this.run.status==='terminal')return;this.starting=true;try{await this.ensureStarted();if(!this.dead&&!this.teacherPaused)await baseStart();}catch{h.pause('Connection lost. Reconnect before starting.');}finally{this.starting=false;}};
  h.resume=()=>{if(this.teacherPaused||this.run.status==='terminal')return;if(this.offline){this.save(h.adapter.snapshot(h.state));return;}baseResume();};
  h.overlay=()=>{baseOverlay();this.decorate();};
  h.onRestart=()=>{};
  this.css.onload=()=>h.fit();this.decorate();this.update(run,paused,deadline,{serverNow});if(snap.outcome&&run.status!=='terminal')this.save(snap);
  this.timer=setInterval(()=>{if(this.dead)return;if(Date.now()-this.lastContact>30000&&!this.offline){this.offline=true;h.pause('Connection lost. Flight paused; the crew window continues. Reconnecting…');}if(this.pending)this.flush();this.decorate();},1000);
 }
 async ensureStarted(){
  if(this.run.started||this.run.status==='terminal')return;
  if(this.startPromise)return this.startPromise;
  this.startPromise=this.transmit('aerial.start',this.run.snapshot).finally(()=>this.startPromise=null);return this.startPromise;
 }
 async transmit(type,snapshot){
  const extra={runId:this.run.runId,configRevision:this.run.config.configRevision,seq:++this.seq,commandId:crypto.randomUUID(),snapshot};
  const response=await this.send(type,extra);if(this.dead)return;
  const team=response.teams.find(t=>t.finale?.run?.runId===this.run.runId),record=team?.finale?.run;
  this.lastContact=Date.now();this.offline=false;
  if(record){this.run=record;if(record.status==='terminal'&&!this.host.state.outcome){this.host.state=restore(record.config,record.snapshot);this.host.pause();}}
  this.persist(snapshot);return record;
 }
 persist(snapshot){try{localStorage.setItem(this.key,JSON.stringify({seq:this.seq,snapshot}));}catch{if(this.host)this.host.message='Local recovery storage unavailable; server checkpoints remain available.';}}
 save(snapshot){if(this.dead)return;this.persist(snapshot);if(!this.host||!this.host.started&&!snapshot.outcome&&snapshot.mode!=='assisted')return;this.pending=snapshot;this.flush();}
 async flush(){if(this.dead||this.sending||!this.pending||this.teacherPaused||this.run.status==='terminal')return;this.sending=true;
  try{await this.ensureStarted();if(this.dead||this.run.status==='terminal')return;const snapshot=this.pending;this.pending=null;await this.transmit(snapshot.outcome?'aerial.complete':snapshot.mode==='assisted'?'aerial.assist':'aerial.progress',snapshot);}
  catch{this.pending=this.host.adapter.snapshot(this.host.state);this.host.message='Saving flight record… connection retry pending.';}
  finally{this.sending=false;}
 }
 update(run,paused,deadline,meta={}){if(this.dead)return;this.deadline=deadline;if(meta.serverNow)this.offset=meta.serverNow-Date.now();const wasPaused=this.teacherPaused;this.teacherPaused=paused;if(wasPaused&&!paused){this.root.querySelectorAll('[data-assist]').forEach(b=>b.disabled=false);this.host.overlay();}
  if(run&&run.seq>=this.run.seq){this.run=run;this.seq=Math.max(this.seq,run.seq);this.lastContact=Date.now();this.offline=false;}
  if(paused)this.host.pause('Teacher paused the mission.');
  if(run?.status==='terminal'){this.pending=null;if(!this.host.state.outcome)this.host.state=restore(run.config,run.snapshot);this.host.pause();}
  this.decorate();
 }
 decorate(){if(this.dead||!this.host)return;const root=this.root;
  root.querySelector('.flight-top small').textContent='Cartridge v0.3.0 · Crew escort';
  for(const selector of ['[data-settings]','[data-restart]'])root.querySelector(selector).hidden=true;
  const link=root.querySelector('.flight-top a');link.removeAttribute('href');
  let note=root.querySelector('[data-crew-clock]');if(!note){note=document.createElement('small');note.dataset.crewClock='';root.querySelector('.flight-top').append(note);}
  const seconds=Math.max(0,Math.ceil((this.deadline-(Date.now()+this.offset))/1000));note.textContent=this.teacherPaused?'Teacher paused':`Crew window ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  if(this.host.state.outcome){const card=this.host.panel.querySelector('.overlay-card');if(card){const paragraphs=card.querySelectorAll('p');if(paragraphs.length>1)paragraphs[1].textContent=this.run.status==='terminal'?'Your flight is recorded. Waiting for the crew’s final decision.':'Saving your flight result… Keep this page open.';card.querySelector('[data-again]')?.remove();}}
  if(this.teacherPaused){root.querySelectorAll('[data-start],[data-resume],[data-assist],[data-confirm],[data-choice]').forEach(b=>b.disabled=true);root.querySelector('[data-pause]').disabled=true;}else root.querySelector('[data-pause]').disabled=false;
 }
 destroy(){if(this.dead)return;this.host.save();this.dead=true;clearInterval(this.timer);this.host.destroy();this.css.remove();this.root.style.cssText='';}
}
