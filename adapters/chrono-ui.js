import {gateRunId,sharedGateSlots} from './arcade-math.js';
export const arcadeSettingsMarkup=()=>'<p>Your teacher sets your math practice from the teacher desk.</p>';
export function bindArcadeSettings(){}
export function openArcadeUI({save,id,persist,onComplete,restartRelay}){
 if(id==='relay'&&(restartRelay||!localStorage.getItem('arcade-chrono-relay')))localStorage.setItem('arcade-chrono-relay','relay:'+crypto.randomUUID());
 const key=id==='relay'?localStorage.getItem('arcade-chrono-relay'):gateRunId(save,id)+':'+id;
 window.arcadeGate(key,{onCorrect:r=>{save.records.push({id:crypto.randomUUID(),moduleId:'shared',typeId:r.skillId,skill:r.skillName,support:r.attempts===1?'independent':'self-corrected',attempts:r.attempts,errors:[],boundary:[],representation:'text',at:Date.now()});save.records=save.records.slice(-160);persist();}}).then(({count})=>{
  const entry=save.sharedGates[id]={runId:id==='relay'?key:gateRunId(save,id),count,completed:count,gate:null,draft:''};
  if(id!=='relay'){for(const p of sharedGateSlots(id,entry))if(!save.answered.includes(p.id))save.answered.push(p.id);if(!save.solved.includes(id))save.solved.push(id);}
  if(id==='relay')localStorage.removeItem('arcade-chrono-relay');save.sharedMath.gate=null;persist();onComplete();void window.arcadeFlush();
 }).catch(()=>{});
}
