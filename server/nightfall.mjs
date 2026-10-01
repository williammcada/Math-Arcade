import * as core from '../build/nightfall/games/nightfall/simulation.js';
const fail=m=>{throw Object.assign(Error(m),{status:409});};
export function create(options={}){
 const loadout=options.loadout??['carbine','ammo-pouch','vest'],threat=options.threat??1;
 if(!Number.isInteger(threat)||threat<0||threat>4||!Array.isArray(loadout)||loadout.length>3||new Set(loadout).size!==loadout.length||loadout.some(x=>!['carbine','ammo-pouch','vest'].includes(x)))fail('Choose a valid threat and up to three distinct resources.');
 return {...core.createState(loadout,'clinic',threat),arcadeMode:'action',feedback:''};
}
export function step(s,input,dt){
 if(s.arcadeMode==='accessible'||s.outcome)return;
 core.step(s,input,dt);
 if(!s.outcome&&s.time>=7200)s.outcome='timed_out';
 if(s.outcome)for(const k of Object.keys(input))input[k]=false;
}
export function command(s,input){
 if(s.outcome)return;
 if(input.action==='assist'){s.arcadeMode='accessible';s.interact=0;s.interactId=null;s.feedback='Accessible city mission. Your objectives, supplies and spent equipment are preserved.';return;}
 if(s.arcadeMode!=='accessible')fail('Open accessible mode first.');
 const target=core.nextObjective(s);if(input.objective!==target?.id)fail('This objective has changed. Check the current mission.');
 s.events=[];s.feedback='';
 if(['safe','risk'].includes(input.action)){
  if(!target)fail('No objective remains.');
  if(input.action==='risk'){const cost=s.damage===2?2:4;if(s.ammo>=cost){s.ammo-=cost;s.shots+=cost;}else if(s.vest){s.vest--;s.blocks++;}else{ s.feedback='You lack ammunition and protection. Use the covered route.';return;}}
  core.completeTask(s,target.id);
 }else if(['alarm','diversion'].includes(input.action)&&!s.assistedStoreDiversion){
  if(input.action==='alarm')core.triggerDistraction(s,'alarm');else core.breakWindow(s,'store-west');s.assistedStoreDiversion=true;
 }else if(input.action==='enter'&&s.assistedStoreDiversion&&!s.assistedStoreEntered){core.breakWindow(s,'store-east');s.assistedStoreEntered=true;}
 else if(input.action==='shotgun'&&s.assistedStoreEntered&&!s.shotgun)core.collectShotgun(s);
 else if(input.action==='survivor'&&s.assistedStoreEntered&&!s.tasks.survivor)core.completeTask(s,'survivor');
 else fail('Choose an available mission action.');
 if(s.outcome==='success')s.outcome='assisted_success';
}
