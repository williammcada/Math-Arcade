// v0.11.0 (Math Engine 0.37.0): questions without one discrete answer are no longer game items.
// Saved selections may still name them, and the Engine rejects a selection with an unknown id
// ("Choose valid skills."), which would stop students starting games and teachers saving sets.
// On every start this removes such ids from everything the workspace stores, keeps each setting
// usable, regenerates any open question that came from a removed skill, and leaves the teacher a
// notice. It is idempotent: a clean workspace is unchanged.
import {find,gameExclusion,configError,freshMath,Practice,contentHash} from '../build/math/engine.js';

const clone=structuredClone;
const known=id=>!!find(id);

// Removes unknown ids from a config in place. Returns the removed ids.
function prune(config){
 if(!config||!Array.isArray(config.selected))return [];
 const removed=config.selected.filter(id=>!known(id));
 if(removed.length)config.selected=config.selected.filter(known);
 return removed;
}
// A config that is still invalid after pruning (for example, every targeted item was removed)
// falls back to the default practice settings, keeping the teacher's per-gate counts.
function fallback(config){
 const base=freshMath('S01').config;
 return {...base,count:config.count??base.count,...(config.kgPerWave!==undefined?{kgPerWave:config.kgPerWave}:{})};
}
// Repairs a Practice gate in place against `effective`. Returns true when its question changed.
function repairGate(math,gate,effective,removed){
 if(!gate||!gate.config)return false;
 removed.push(...prune(gate.config));
 if(Array.isArray(gate.bag))gate.bag=gate.bag.filter(known);
 let invalid=!!configError(gate.config);
 if(invalid){const count=gate.config.count;gate.config={...clone(effective),count};invalid=!!configError(gate.config);}
 if(invalid||(gate.item?.skillId&&known(gate.item.skillId)))return false;
 // The open question came from a removed skill: draw the next one from the repaired gate.
 const held=math.gate;math.gate=gate;
 try{gate.bag=[];new Practice(math).next();}finally{math.gate=held;}
 return true;
}

export function migrateWorkspace(s,{now=Date.now(),newId}){
 const removed=[],places={classDefaults:0,individual:0,mathSets:0,openQuestions:0};
 for(const c of s.classes||[]){
  const r=prune(c.config);if(r.length){removed.push(...r);places.classDefaults++;c.revision=(c.revision||0)+1;}
  if(configError(c.config)){c.config=fallback(c.config);places.classDefaults++;c.revision=(c.revision||0)+1;}
  for(const p of c.students||[]){
   if(p.override){const r2=prune(p.override);if(r2.length){removed.push(...r2);places.individual++;p.revision=(p.revision||0)+1;}if(configError(p.override)){p.override=null;p.revision=(p.revision||0)+1;}}
   const effective=p.override||c.config,m=p.math;if(!m)continue;
   removed.push(...prune(m.config));if(m.config&&configError(m.config))m.config=clone(effective);
   if(m.position&&!known(m.position))m.position=null;
   if(Array.isArray(m.returnTo))m.returnTo=m.returnTo.filter(known);
   if(repairGate(m,m.gate,effective,removed)){places.openQuestions++;if(p.activity){p.activity.itemId=newId();p.activity.draft='';}}
   for(const saved of Object.values(p.campaigns||{}))for(const entry of Object.values(saved.gates||{}))
    if(entry?.gate&&repairGate(m,entry.gate,effective,removed)){places.openQuestions++;entry.itemId=newId();entry.draft='';}
  }
 }
 for(const set of s.mathSets||[]){const r=prune(set.config);if(r.length){removed.push(...r);places.mathSets++;}}
 const ids=[...new Set(removed)];
 if(ids.length){
  const reasons={};for(const id of ids){const why=gameExclusion(id)||'unknown';reasons[why]=(reasons[why]||0)+1;}
  s.mathNotice={at:now,engine:contentHash,removed:ids.length,reasons,places,ids:ids.slice(0,200)};
 }
 s.engineHash=contentHash;
 return ids.length;
}
