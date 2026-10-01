import * as flight from '../build/coastal/games/aerial-shooter/core.js';
import {StealthSimulation} from '../build/vault7/stealth-core.js';
import {fallbackScene} from '../build/vault7/fallback.js';
const fail=message=>{throw Object.assign(Error(message),{status:409});};
const hydrate=s=>Object.assign(Object.create(StealthSimulation.prototype),s);
export const keysFor=game=>game==='vault7'?['left','right','jump','interact','jam','cloak','confirm']:['left','right','up','down'];
export function createRound(game,identity,options={}){
 if(game!=='vault7')return flight.createRun(identity);
 const route=options.route||'corridor',loadout=options.loadout??['toolkit','cloak'];
 if(!['corridor','shaft'].includes(route)||!Array.isArray(loadout)||loadout.length>2||new Set(loadout).size!==loadout.length||loadout.some(x=>!['toolkit','cloak'].includes(x)))fail('Choose a valid route and equipment.');
 const sim=new StealthSimulation({route,loadout,adverseCount:0});sim.start();return {...sim,arcadeMode:'action',assistStep:0,selected:null,confirmHeld:0,feedback:'',unsafe:[]};
}
export function snapshot(game,s){return game==='vault7'?{...s,events:[]}:flight.snapshot(s);}
export function step(game,s,input,dt){
 if(game!=='vault7'){flight.step(s,input,dt);return;}
 const sim=hydrate(s);sim.events=[];
 if(sim.arcadeMode==='accessible'){
  sim.confirmHeld=sim.assistStep===2&&sim.selected!==null&&input.confirm?sim.confirmHeld+dt:0;
  if(sim.confirmHeld>=.6){resolveChoice(sim,sim.selected);sim.confirmHeld=0;}
 }else sim.step(input,dt);
 Object.assign(s,sim);
 if(sim.events.some(e=>e.type==='detected'||e.type==='complete'))for(const k of Object.keys(input))input[k]=false;
}
function progress(sim){
 sim.assistStep++;sim.checkpoint=['A','B','C'][sim.assistStep-1];sim.panel=true;sim.card=sim.assistStep===3;sim.selected=null;sim.confirmHeld=0;sim.unsafe=[];
 if(sim.assistStep===3){sim.complete('fallback_extracted');return;}
 // Preserve the source's automatic Toolkit bypass of the sensor scene.
 if(sim.assistStep===1&&sim.level.loadout.includes('toolkit')&&!sim.jams.includes('A')){sim.jams.push('A');sim.feedback+=' Your Toolkit disables the sensor.';progress(sim);}
}
function resolveChoice(sim,choice){
 const scene=fallbackScene(sim.level.route,sim.assistStep,sim.level.loadout,0);
 if(choice!==scene.correct){sim.detections++;sim.integrity--;sim.unsafe.push(choice);sim.selected=null;sim.feedback='Detected. '+scene.explanation;if(sim.integrity<=0)sim.complete('captured');}
 else{sim.feedback=scene.explanation;progress(sim);}
}
export function vaultAction(s,input){
 const sim=hydrate(s);if(sim.outcome)return;
 if(input.action==='assist'){
  if(sim.arcadeMode==='accessible')return;
  sim.arcadeMode='accessible';sim.assistStep=Math.min(2,[null,'A','B','C'].indexOf(sim.checkpoint));sim.state='playing';sim.selected=null;sim.confirmHeld=0;sim.feedback='Accessible extraction. Your remaining integrity and equipment are preserved.';
  if(sim.assistStep===1&&sim.level.loadout.includes('toolkit')&&!sim.jams.includes('A')){sim.jams.push('A');progress(sim);}
 }else{
  if(sim.arcadeMode!=='accessible'||input.step!==sim.assistStep)fail('This scene has changed. Check the current scene.');
  if(input.action==='choice'){
   if(!Number.isInteger(input.choice)||input.choice<0||input.choice>2||sim.unsafe.includes(input.choice))fail('Choose an available position.');
   if(sim.assistStep===2){sim.selected=input.choice;sim.confirmHeld=0;}else resolveChoice(sim,input.choice);
  }else if(input.action==='cloak'){
   if(!sim.level.loadout.includes('cloak')||sim.cloakUsed)fail('No unused Cloak remains.');
   sim.cloakUsed=true;sim.feedback='Your Cloak carries you safely through this sector.';progress(sim);
  }else fail('Unknown extraction action.');
 }
 Object.assign(s,sim);
}
