import * as extra from './extra-rounds.mjs';
import * as iron from './ironbreak.mjs';
import * as night from './nightfall.mjs';
import * as flight from '../build/coastal/games/aerial-shooter/core.js';
import {StealthSimulation} from '../build/vault7/stealth-core.js';
import {fallbackScene} from '../build/vault7/fallback.js';
const fail=message=>{throw Object.assign(Error(message),{status:409});};
const hydrate=s=>Object.assign(Object.create(StealthSimulation.prototype),s);
export const keysFor=game=>game==='journey'?['left','right','up','down','attack','jump','magic']:game==='blackline'?['left','right','brake','boost']:game==='false-haven'?['left','right','up','down','run','fire','interact','weapon']:game==='robot'?['left','right','up','down','jump','prone','noFire']:game==='nightfall'?['left','right','up','down','run','fire','interact','weapon']:game==='vault7'?['left','right','jump','interact','jam','cloak','confirm']:['left','right','up','down'];
export function createRound(game,identity,options={}){
 if(extra.extraGames.includes(game))return extra.create(game,identity,options);
 if(game==='robot')return iron.create(options);
 if(game==='nightfall')return night.create(options);
 if(game!=='vault7')return flight.createRun(identity);
 const route=options.route||'corridor',loadout=options.loadout??['toolkit','cloak'];
 if(!['corridor','shaft'].includes(route)||!Array.isArray(loadout)||loadout.length>2||new Set(loadout).size!==loadout.length||loadout.some(x=>!['toolkit','cloak'].includes(x)))fail('Choose a valid route and equipment.');
 const sim=new StealthSimulation({route,loadout,adverseCount:0});sim.start();return {...sim,arcadeMode:'action',assistStep:0,selected:null,confirmHeld:0,feedback:'',unsafe:[]};
}
export function snapshot(game,s){return ['vault7','nightfall','robot',...extra.extraGames].includes(game)?{...s,events:[]}:flight.snapshot(s);}
export function step(game,s,input,dt){
 if(extra.extraGames.includes(game)){extra.step(game,s,input,dt);return;}
 if(game==='robot'){iron.step(s,input,dt);return;}
 if(game==='nightfall'){night.step(s,input,dt);return;}
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

export const nightfallAction=night.command;

export const ironbreakAction=iron.command;

export const extraAction=extra.command;

// v0.4.1: action rounds run on the student's device, as in MathQuest. The server
// stores the device snapshot inside a generic envelope and keeps time limits.
const LIMITS={nightfall:7200,vault7:180,journey:180,'false-haven':300,blackline:300,kingsgate:300,coastal:300,robot:300};
const TIMEOUTS={kingsgate:'timed_out',nightfall:'timed_out',vault7:'timed_out',journey:'timed_out','false-haven':'timed_out',blackline:'timeout',coastal:'defeat',robot:'time_window_closed'};
export const limitFor=game=>LIMITS[game]??300;
export const timeoutOutcome=game=>TIMEOUTS[game]||'timed_out';
export const SNAPSHOT_GRACE_MS=5000;
function finiteTree(v,d=0){
 if(d>24)return false;if(v===null||typeof v==='string'||typeof v==='boolean')return true;
 if(typeof v==='number')return Number.isFinite(v);
 if(Array.isArray(v))return v.length<=5000&&v.every(x=>finiteTree(x,d+1));
 if(typeof v==='object')return Object.values(v).every(x=>finiteTree(x,d+1));
 return false;
}
export function acceptSnapshot(game,old,incoming){
 if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))fail('A round snapshot is required.');
 let text;try{text=JSON.stringify(incoming);}catch{fail('Invalid round snapshot.');}
 if(text.length>400000)fail('Round snapshot is too large.');
 const s=JSON.parse(text);
 if(!finiteTree(s))fail('Invalid round snapshot values.');
 if(old.outcome)fail('This round has already ended.');
 if((s.arcadeMode??null)!==(old.arcadeMode??null))fail('Round mode cannot change from a snapshot.');
 if(s.outcome!==undefined&&s.outcome!==null&&typeof s.outcome!=='string')fail('Invalid round outcome.');
 if(s.outcome===undefined)s.outcome=null;
 return snapshot(game,s);
}
