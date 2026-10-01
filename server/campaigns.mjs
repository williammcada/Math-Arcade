import {randomUUID as id} from 'node:crypto';
import {Practice} from '../build/math/shared-math/engine.js';
const fail=(message,status=409)=>{throw Object.assign(Error(message),{status});};
const clone=structuredClone;
export function installCampaigns(Model){
 Model.prototype.campaign=function(s,t,input){
  const {a,c,p}=this.student(s,t),activity=p.activity;
  if(!activity?.campaign||activity.game!==input.game)fail('Open this adventure from the arcade.');
  p.lastSeen=this.now();p.campaigns||={};const saved=p.campaigns[input.game]||=( {storage:{},revision:0,gates:{}} );
  if(input.action==='load'){this.canPlay(c);if(!c.session.enabled.includes(input.game))fail('This game is closed.',403);activity.lease=id();return {lease:activity.lease,storage:saved.storage,revision:saved.revision,effective:this.config(c,p)};}
  if(input.lease!==activity.lease)fail('This adventure is open in another tab. Return to the arcade.');
  const playing=c.session.status==='open'&&c.session.enabled.includes(input.game);
  if(input.action==='save'){
   if(input.revision!==saved.revision)fail('Saved work changed. Reload to recover it.');
   const v=input.storage;
   if(!v||Array.isArray(v)||typeof v!=='object'||Object.keys(v).length>30||Object.entries(v).some(([k,v])=>k.length>100||typeof v!=='string')||JSON.stringify(v).length>4000000)fail('Invalid adventure save.',400);
   saved.storage=clone(v);saved.revision++;
  }else if(input.action==='gate'){
   this.canPlay(c);if(!playing)fail('This game is closed.',403);if(input.game==='math-civ')fail('Math Civ does not use arcade gates.',400);
   if(typeof input.key!=='string'||!input.key||input.key.length>240)fail('Invalid gate.',400);
   if(activity.nativeKey&&p.math.gate)saved.gates[activity.nativeKey]={count:p.math.gate.config.count,gate:clone(p.math.gate),itemId:activity.itemId,draft:activity.draft||''};
   activity.nativeKey=input.key;let entry=saved.gates[input.key];
   if(!entry){p.math.gate=null;const practice=new Practice(p.math);practice.saveConfig(this.config(c,p));if(input.game==='chrono'&&input.key.startsWith('relay:'))p.math.config.count=5;practice.open(input.game,input.key);entry=saved.gates[input.key]={gate:clone(p.math.gate),count:p.math.gate.config.count,itemId:id(),draft:''};}
   p.math.gate=clone(entry.gate);activity.itemId=entry.itemId;activity.gateId=input.key;activity.draft=entry.draft;activity.grant=false;
   return {count:entry.count,complete:!!entry.complete,state:this.view(c,p,a),draft:entry.draft};
  }else if(input.action==='draft'){
   if(typeof input.draft!=='string'||input.draft.length>150)fail('Invalid draft.',400);
   if(input.itemId===activity.itemId&&activity.nativeKey&&p.math.gate){activity.draft=input.draft;saved.gates[activity.nativeKey].draft=input.draft;}
  }else if(input.action!=='poll')fail('Unknown adventure request.',400);
  return {revision:saved.revision,status:c.session.status,playing,effective:this.config(c,p)};
 };
 Model.prototype.saveNativeGate=function(p){
  if(!p.activity?.campaign||!p.activity.nativeKey)return;
  const ac=p.activity,store=p.campaigns[ac.game];store.gates[ac.nativeKey]={count:store.gates[ac.nativeKey]?.count,gate:clone(p.math.gate),itemId:ac.itemId,complete:!p.math.gate,draft:ac.draft||''};ac.grant=false;
 };
}
