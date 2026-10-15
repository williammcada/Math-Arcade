// Kingsgate in Math Arcade: device-run defense with between-wave question rounds.
// Gold from questions is only accepted up to what the server has credited for correct answers.
export const BREAK_GOLD=30;
// Kingsgate questions per wave: its own teacher setting, separate from "questions per gate". Default 1.
export const KG_PER_WAVE_DEFAULT=1,KG_PER_WAVE_MAX=5;
export const kgPerWave=cfg=>Number.isInteger(cfg?.kgPerWave)&&cfg.kgPerWave>=1&&cfg.kgPerWave<=KG_PER_WAVE_MAX?cfg.kgPerWave:KG_PER_WAVE_DEFAULT;
const STATS=['kills','leaks','spawned','bounty','mathGold','spent','refund','shots','answered','correct'];
const okInt=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
export function validateArcadeKingsgate(s,kg={credited:0,breaks:[]}){
 const g=s?.g;if(!g)return 'Invalid Kingsgate round.';
 if(s.goldMode!=='arcade'||g.goldMode!=='arcade'||g.breaks!==true||g.startGold!==120||g.gateMax!==20)return 'Kingsgate round settings cannot change.';
 if(!g.stats||STATS.some(k=>!okInt(g.stats[k],0,1000000)))return 'Invalid defense counters.';
 const done=kg.breaks?.length||0,credited=kg.credited||0,answered=(kg.breaks||[]).reduce((n,b)=>n+b.answered,0);
 if(!okInt(g.breakDone,0,done))return 'Answer the question round before the next wave.';
 if(g.stats.correct>credited||g.stats.answered>answered||g.stats.mathGold>credited*BREAK_GOLD)return 'Gold from questions exceeds the answers recorded.';
 if(!okInt(g.gold,0,1000000)||g.gold!==g.startGold+g.stats.bounty+g.stats.mathGold+g.stats.refund-g.stats.spent)return 'Gold does not balance.';
 if(!okInt(g.wave,0,12)||!okInt(g.gateHp,0,g.gateMax))return 'Invalid wave or gate state.';
 if(g.wave>done+1)return 'Answer the question round before the next wave.';
 return null;
}
