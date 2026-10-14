import {falseHavenAdapter} from '../build/nightfall/games/nightfall/false-haven-adapter.js';
import {blacklineAdapter,EQUIPMENT} from '../build/blackline/games/blackline/adapter.js';
import {journeyAdapter} from '../build/journey/adapter.js';
import {kingsgateAdapter} from '../build/kingsgate/games/kingsgate/adapter.js';
import {blackoutAdapter} from '../build/blackout/games/blackout/adapter.js';
import {ITEM_TO_CORE as BLACKOUT_ITEMS} from '../build/blackout/games/blackout/config.js';
import {completeTask,nextObjective} from '../build/nightfall/games/nightfall/simulation.js';
import {havenTick} from '../build/nightfall/games/nightfall/false-haven-world.js';
export const extraGames=['false-haven','blackline','journey','kingsgate','blackout'];
const adapters={'false-haven':falseHavenAdapter,blackline:blacklineAdapter,journey:journeyAdapter,kingsgate:kingsgateAdapter,blackout:blackoutAdapter};
const fail=m=>{throw Object.assign(Error(m),{status:409});};
export function create(game,identity,options){
 if(game==='kingsgate')return {...kingsgateAdapter.create({runId:identity.runId,goldMode:'arcade'}),arcadeMode:'action'};
 const allowed=game==='blackline'?EQUIPMENT:game==='blackout'?Object.keys(BLACKOUT_ITEMS):['carbine','ammo-pouch','vest'];
 if(game!=='journey'){
  const gear=options.loadout??allowed;
  if(!Array.isArray(gear)||gear.length>3||new Set(gear).size!==gear.length||gear.some(x=>!allowed.includes(x)))fail('Choose up to three distinct listed resources.');
  options={...options,loadout:gear};
  if(options.threat!==undefined&&(!Number.isInteger(options.threat)||options.threat<0||options.threat>4))fail('Choose a listed threat.');
 }
 return {...adapters[game].create({...options,runId:identity.runId}),arcadeMode:'action'};
}
// Blackout keeps a class instance (core Run) that plain snapshots lose; rebuild it from the snapshot first.
export function revive(game,s){if(game==='blackout'&&s.game&&typeof s.game.step!=='function')Object.assign(s,blackoutAdapter.create({runId:s.runId,loadout:s.loadout,mode:s.mode,snapshot:s}));return s;}
export function step(game,s,keys,dt){if(!s.outcome&&s.arcadeMode==='action'){revive(game,s);adapters[game].step(s,keys,dt);}}
export function command(game,s,input){
 if(s.outcome)return;if(game==='journey')fail('Journey uses single-player action controls.');if(game==='blackout')fail('Blackout Protocol uses puzzle controls only.');
 if(input.action==='assist'){s.arcadeMode='accessible';return;}
 if(s.arcadeMode!=='accessible'||input.action!=='safe')fail('Choose an available guided action.');
 if(game==='blackline'||game==='kingsgate'){
  if(input.objective!==String(s.guideStep))fail('This step has changed.');
  if(++s.guideStep===6)s.outcome='assisted_completed';
 }else{
  const t=nextObjective(s);if(!t||input.objective!==t.id)fail('This objective has changed.');
  if(t.id==='passage_drained'){s.haven.drainStarted=s.time-6;havenTick(s,0);}
  else if(t.id==='trolley_parked'){s.tasks.trolley_parked=true;s.haven.trolleyProgress=1;}
  else completeTask(s,t.id);
  if(s.outcome==='success')s.outcome='assisted_completed';
 }
}
