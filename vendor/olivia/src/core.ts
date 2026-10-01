import {freshMath,validMath,type MathState} from './shared-math/engine';
import {LEVEL_REVISION,pickupFor} from './levels';
import {beadDesigns} from './beads';
export {beadColors,beadNames} from './beads';
import {factBank,eligibleFact,evidenceKey,type Fact} from './facts';
import {expansionSkills,isExpansion,type ExpansionId} from './expansion';
export type SkillId = ExpansionId|'N0'|'N1'|'A1'|'A2'|'A3'|'A4'|'A5'|'A6'|'A7'|'S1'|'S2'|'S3'|'S4'|'S5'|'S6';
export const skills: {id:SkillId;label:string;prerequisites:SkillId[];strategy:string}[] = [
 {id:'N0',label:'Seeing numbers to 5',prerequisites:[],strategy:'See small groups without counting every time.'},
 {id:'N1',label:'Making numbers to 5',prerequisites:['N0'],strategy:'A whole can be made from two parts.'},
 {id:'A1',label:'Adding within 5',prerequisites:['N1'],strategy:'Put the two parts together.'},
 {id:'S1',label:'Taking away within 5',prerequisites:['A1'],strategy:'Cross out the part taken away. Count what remains.'},
 {id:'A2',label:'Adding 0, 1 and 2',prerequisites:['A1'],strategy:'Start with the larger number. Count on.'},
 {id:'A3',label:'Doubles within 10',prerequisites:['A1'],strategy:'Two equal groups make a double.'},
 {id:'A4',label:'Making 5 and 10',prerequisites:['A2','A3'],strategy:'Fill a five-frame, then finish the ten-frame.'},
 {id:'S2',label:'Taking away 0, 1 and 2',prerequisites:['S1','A2'],strategy:'Count back in small steps.'},
 {id:'S3',label:'Subtraction within 10',prerequisites:['S2','A4'],strategy:'Use the whole and the missing part.'},
 {id:'A5',label:'Adding to teen numbers',prerequisites:['A4'],strategy:'Keep the ten. Add the ones without crossing another ten.'},
 {id:'A6',label:'Adding across 10',prerequisites:['A5'],strategy:'Split the smaller part. Make ten, then add what is left.'},
 {id:'A7',label:'Addition within 20',prerequisites:['A6'],strategy:'Use tens and ones, doubles, or make ten.'},
 {id:'S4',label:'Taking away from teens',prerequisites:['S3','A5'],strategy:'Keep the ten and take away some ones.'},
 {id:'S5',label:'Subtracting across 10',prerequisites:['S4','A6'],strategy:'Take away to reach ten, then take away the rest.'},
 {id:'S6',label:'Subtraction within 20',prerequisites:['S5','A7'],strategy:'Use tens and ones and related addition facts.'},
 ...expansionSkills.map(([id,label,strategy],i)=>({id,label,strategy,prerequisites:(i?[expansionSkills[i-1][0]]:[]) as SkillId[]}))
];
export interface Quest {id:number;name:string;animal:string;sprite:number;mapSprite?:number;portrait?:string;subtitle:string;story:string;ending:string;color:string}
export const quests:Quest[] = [
 {id:0,name:'Buttonberry Brooks',animal:'Mochi',sprite:8,subtitle:'Meadow · small stream jumps',story:'Mochi is lost beyond the picnic streams! Hop across the water and gather colorful beads along the way.',ending:'Mochi curls up beside you. Every bead in your bracelet came from your meadow adventure.',color:'#f27fa6'},
 {id:1,name:'Treetop Tangle',animal:'Pip',sprite:9,subtitle:'Forest · moving leaves and springs',story:'Pip followed blue beads into the tall forest. Ride the moving leaves and bounce on golden mushrooms to find him!',ending:'Pip is home! Your forest beads are ready for a bracelet of your own.',color:'#75d9b5'},
 {id:2,name:'Moonstone Cavern',animal:'Lumi',sprite:7,subtitle:'Crystal cave · glowing secret trails',story:'Lumi is waiting inside Moonstone Cavern. Moon symbols hide special beads: use Moon Sight to make them shine!',ending:'Lumi steps into the light. Your crystal treasures will make a beautiful bracelet.',color:'#a98be8'},
 {id:3,name:'Lumi’s Cloud Flight',animal:'Poppy',sprite:11,mapSprite:7,subtitle:'Unicorn flight · fast sky adventure',story:'Poppy is waiting high above the clouds! Open the sky gate, settle onto Lumi, and soar. Swoop past storm clouds, kites, and balloons to gather beautiful beads.',ending:'You and Lumi land at the rainbow picnic. Poppy bounds over to admire the beads from your ride.',color:'#f7c84b'},
 {id:4,name:'Sunstone Sands',animal:'Saffy',sprite:8,portrait:'animal-fox.png',subtitle:'Desert · crumbling sandstone and drifting carpets',story:'Saffy, a tiny fennec fox, followed a string of bright beads into the Sunstone Sands. Cross the warm dunes, leap from crumbling sandstone, and ride the drifting carpets to bring her home.',ending:'Saffy trots out of the sun temple with a pocket full of sparkling desert beads.',color:'#f2b856'},
 {id:5,name:'Frostglow Fjord',animal:'Marble',sprite:9,portrait:'animal-seal.png',subtitle:'Ice and snow · floes, brittle shelves and lanterns',story:'Marble, a baby seal, is stranded beyond the Frostglow Fjord. Follow the lanterns over moving ice floes and hurry across brittle snow shelves before they tumble away.',ending:'Marble shakes snow from her whiskers. Your icy treasure beads are ready to shine on a new bracelet.',color:'#9edcf2'}
];
export const DAY=86400000;
export function rng(seed:number) {let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
export interface Problem {id:string;skillId:SkillId;templateId:string;seed:number;a:number;b:number;answer:number;kind:'quantity'|'compose'|'add'|'subtract'|'text';help?:string;choices?:string[];story?:string;layout:number;prompt:string;family:string;}
/**
 * v3 seeds encode a bank position and one of four layouts. The sampler chooses
 * the position; encoding it keeps every displayed question reproducible.
 */
export function generate(skillId:SkillId,seed:number):Problem {
 const bank=factBank(skillId),unsigned=seed>>>0,layout=unsigned%4;
 const {key:_,band:__,...fact}=bank[Math.floor(unsigned/4)%bank.length];
 return {id:`${skillId}-v3-${unsigned}`,skillId,templateId:`${skillId}-v3-${layout}`,seed:unsigned,...fact,layout};
}
export function validateProblem(p:Problem){
 if(isExpansion(p.skillId))return factBank(p.skillId).some(f=>f.prompt===p.prompt&&f.a===p.a&&f.b===p.b&&f.answer===p.answer&&f.kind===p.kind&&f.story===p.story&&JSON.stringify(f.choices)===JSON.stringify(p.choices));
 const kind=p.skillId==='N0'?'quantity':p.skillId==='N1'?'compose':p.skillId.startsWith('S')?'subtract':'add';
 return skills.some(s=>s.id===p.skillId)&&eligibleFact(p.skillId,p.a,p.b)&&p.kind===kind&&
 Number.isInteger(p.answer)&&p.answer>=0&&p.answer<=20&&
 (p.kind==='subtract'?p.a-p.b===p.answer:p.a+p.b===p.answer);
}
export interface Scaffold {instruction:string;answer:number;count:number;mode:'part-a'|'part-b'|'whole'|'original'|'take'|'remaining'|'make-ten'|'rest'}
export function buildScaffold(p:Problem):Scaffold[]{
 const original:Scaffold={instruction:'You built it! Try the original question.',answer:p.answer,count:p.answer,mode:'original'};
 if(isExpansion(p.skillId))return [{instruction:p.help||'Try the question one step at a time.',answer:p.answer,count:0,mode:'whole'},original];
 if(p.kind==='quantity')return [{instruction:'Touch every bead. Listen as we count.',answer:p.answer,count:p.answer,mode:'whole'},original];
 if(p.kind==='subtract')return [
  {instruction:`Start with ${p.a} beads. How many are in the whole?`,answer:p.a,count:p.a,mode:'whole'},
  {instruction:`Tap ${p.b} beads to take them away. How many are we taking away?`,answer:p.b,count:p.a,mode:'take'},
  {instruction:p.a>10&&p.answer<10?`Take ${p.a-10} to reach 10, then ${p.b-(p.a-10)} more. Count what remains.`:'Count the beads that are left.',answer:p.answer,count:p.a,mode:'remaining'},original];
 if(p.a<10&&p.b<10&&p.answer>10){
  const gap=10-p.a;
  return [{instruction:`Start at ${p.a}. How many more beads fill the first ten?`,answer:gap,count:gap,mode:'make-ten'},
   {instruction:`Split ${p.b} into ${gap} and another part. How many are left to add?`,answer:p.b-gap,count:p.b-gap,mode:'rest'},
   {instruction:`Ten and ${p.b-gap} more. How many altogether?`,answer:p.answer,count:p.answer,mode:'whole'},original];
 }
 return [{instruction:'First, count the pink part.',answer:p.a,count:p.a,mode:'part-a'},
  {instruction:'Now count the blue part.',answer:p.b,count:p.b,mode:'part-b'},
  {instruction:p.skillId==='A2'?`Start at ${Math.max(p.a,p.b)}. Add ${Math.min(p.a,p.b)} more.`:p.skillId==='A3'?'Two matching groups. Count them together.':'Bring the two parts together. Count the whole.',answer:p.answer,count:p.answer,mode:'whole'},original];
}
export function spokenProblem(p:Problem){if(isExpansion(p.skillId))return `${p.story||''} ${p.prompt}`.replace(/(\d+)\/(\d+)/g,'$1 over $2').replace(/___/g,'blank').replace(/×/g,'times').replace(/÷/g,'divided by').replace(/−/g,'minus');return p.kind==='quantity'?p.prompt:`${p.a} ${p.kind==='subtract'?'minus':'plus'} ${p.b}. How many ${p.kind==='subtract'?'are left':'altogether'}?`;}
export interface Attempt {story?:string;choices?:string[];id:string;sessionId:string;time:number;skillId:SkillId;family:string;templateId:string;seed:number;prompt:string;answer:number;firstResponse:number;firstTryCorrect:boolean;initialIndependent?:boolean;hint:boolean;scaffoldDepth:number;latencyMs:number|null;representation:string;context:'practice'|'gate'|'refill'|'parent-check'}
export interface SkillProgress {consolidated:boolean;fluent:boolean;due:number;interval:number;resetAt?:number}
export interface Bracelet {id:string;name:string;beads:number[];charm:'star'|'moon'|'heart';time:number}
export interface QuestRun {id:string;quest:number;phase:'story'|'practice'|'platform'|'gate'|'studio'|'result';skill:SkillId;energy:number;collected:number[];checkpoint:number;gateOpen:boolean;practiceDone:number;gateDone:number;rewarded:boolean;beads:number[];design:number[];charm:'star'|'moon'|'heart';braceletId?:string;levelRevision?:number;flight?:{x:number;y:number}}
export interface Save {mathPractice?:MathState;schemaVersion:2;createdAt:number;settings:{music:number;sfx:number;readAloud:boolean;reducedMotion:boolean;leftHanded:boolean;showCounters:boolean;sessionMinutes:8|10|15;auto:boolean;maxSkill:SkillId;manualSkill:SkillId};completed:number[];rescued:string[];bracelets:Bracelet[];worn?:string;progress:Record<SkillId,SkillProgress>;attempts:Attempt[];summary:{archived:number};active?:QuestRun;session:{id:string;started:number;last:number;newFamilies:string[]}}
export function fresh():Save {const now=Date.now();return {mathPractice:freshMath(),schemaVersion:2,createdAt:now,settings:{music:.16,sfx:.4,readAloud:true,reducedMotion:false,leftHanded:false,showCounters:false,sessionMinutes:10,auto:false,maxSkill:'F01',manualSkill:'S01'},completed:[],rescued:[],bracelets:[],progress:Object.fromEntries(skills.map(s=>[s.id,{consolidated:false,fluent:false,due:0,interval:0}])) as Save['progress'],attempts:[],summary:{archived:0},session:{id:`session-${now}`,started:now,last:now,newFamilies:[]}};}
const validId=(v:unknown)=>skills.some(s=>s.id===v);
const int=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isInteger(v)&&v>=min&&v<=max;
export function validateSave(v:unknown):v is Save {
 if(!v||typeof v!=='object')return false;
 const s=v as Save;
 try {return (s.mathPractice===undefined||validMath(s.mathPractice))&&s.schemaVersion===2 && typeof s.createdAt==='number' && typeof s.session.id==='string'&&Number.isFinite(s.session.started)&&Number.isFinite(s.session.last)&&Array.isArray(s.session.newFamilies)&&s.session.newFamilies.every(x=>typeof x==='string')&&s.session.newFamilies.length<1000&&
 typeof s.settings.auto==='boolean'&&validId(s.settings.maxSkill)&&validId(s.settings.manualSkill)&&[8,10,15].includes(s.settings.sessionMinutes)&&['music','sfx'].every(k=>{const a=s.settings[k as 'music'];return Number.isFinite(a)&&a>=0&&a<=1;})&&['readAloud','reducedMotion','leftHanded','showCounters'].every(k=>typeof s.settings[k as 'readAloud']==='boolean')&&
 skills.every(({id})=>typeof s.progress[id].consolidated==='boolean'&&typeof s.progress[id].fluent==='boolean'&&Number.isFinite(s.progress[id].due)&&int(s.progress[id].interval,0,5))&&
 Array.isArray(s.completed)&&s.completed.every(x=>int(x,0,5))&&Array.isArray(s.rescued)&&s.rescued.every(x=>quests.some(q=>q.animal===x))&&
 Array.isArray(s.bracelets)&&s.bracelets.length<=2000&&s.bracelets.every(b=>typeof b.id==='string'&&typeof b.name==='string'&&b.name.length<=40&&Array.isArray(b.beads)&&b.beads.length>=1&&b.beads.length<=32&&b.beads.every(x=>int(x,0,beadDesigns.length-1))&&['star','moon','heart'].includes(b.charm))&&
 Array.isArray(s.attempts)&&s.attempts.length<=5000&&s.attempts.every(a=>typeof a.id==='string'&&typeof a.sessionId==='string'&&validId(a.skillId)&&Number.isFinite(a.time)&&typeof a.firstTryCorrect==='boolean'&&typeof a.hint==='boolean'&&typeof a.prompt==='string'&&(a.story===undefined||typeof a.story==='string')&&(a.choices===undefined||(Array.isArray(a.choices)&&a.choices.length>=2&&a.choices.length<=5&&a.choices.every(c=>typeof c==='string'&&c.length<=200)&&int(a.answer,0,a.choices.length-1)))&&int(a.answer,0,19999)&&int(a.firstResponse,0,99999)&&(a.latencyMs===null||Number.isFinite(a.latencyMs))&&typeof a.family==='string'&&int(a.scaffoldDepth,0,4))&&Number.isFinite(s.summary.archived)&&
 (!s.active||((!s.active.flight||(int(s.active.quest,3,3)&&Number.isFinite(s.active.flight.x)&&s.active.flight.x>=0&&s.active.flight.x<=16000&&Number.isFinite(s.active.flight.y)&&s.active.flight.y>=40&&s.active.flight.y<=185))&&typeof s.active.id==='string'&&int(s.active.quest,0,5)&&validId(s.active.skill)&&['story','practice','platform','gate','studio','result'].includes(s.active.phase)&&int(s.active.energy,0,6)&&int(s.active.practiceDone,0,5)&&int(s.active.gateDone,0,2)&&int(s.active.checkpoint,0,6)&&typeof s.active.gateOpen==='boolean'&&typeof s.active.rewarded==='boolean'&&Array.isArray(s.active.collected)&&s.active.collected.every(x=>int(x,0,1999))&&Array.isArray(s.active.beads)&&s.active.beads.length<=32&&s.active.beads.every(x=>int(x,0,beadDesigns.length-1))&&Array.isArray(s.active.design)&&s.active.design.every(x=>int(x,0,s.active!.beads.length-1))&&new Set(s.active.design).size===s.active.design.length&&['star','moon','heart'].includes(s.active.charm))); } catch{return false;}
}
/** Add new skills without resetting old evidence, rescues or bracelets. */
export function migrateSave(value:unknown):unknown {
 if(!value||typeof value!=='object')return value;
 const schema=(value as {schemaVersion?:number}).schemaVersion;
 if(schema!==1&&schema!==2)return value;
 const s=structuredClone(value) as Save;
 if(!s.progress||!s.settings)return value;
 if(schema===1){for(const skill of skills)if(!['N0','N1','A1','A2','A3','A4'].includes(skill.id)&&!s.progress[skill.id])s.progress[skill.id]={consolidated:false,fluent:false,due:0,interval:0};s.schemaVersion=2;if(s.settings.maxSkill==='A4')s.settings.maxSkill='S6';if(s.active){s.active.checkpoint=0;s.active.levelRevision=LEVEL_REVISION;}}
 for(const [id] of expansionSkills)if(!s.progress[id])s.progress[id]={consolidated:false,fluent:false,due:0,interval:0};
 if(typeof s.settings.showCounters!=='boolean')s.settings.showCounters=false;
 if(s.mathPractice===undefined){s.mathPractice=freshMath(s.settings.manualSkill,s.settings.auto,s.settings.maxSkill);s.mathPractice.note='Upgraded to shared math settings. Your prior focus and rewards are retained; old evidence is archived separately. Any old unfinished math gate restarts. New mastery begins with new first attempts.';}
 return s;
}
export const SAVE_KEY='olivia-quest-v1';
export class SaveService {
 data:Save; error=''; constructor(private storage?:Storage){this.data=fresh();if(storage){try{const raw=storage.getItem(SAVE_KEY);if(raw){const parsed=migrateSave(JSON.parse(raw));if(validateSave(parsed))this.data=parsed;else this.error='Your saved game needs attention. Open Grown-ups to export it before starting again.';}}catch{this.error='The saved game could not be read. Open Grown-ups to keep a backup.';}}}
 persist(){if(this.error)return false;try{this.storage?.setItem(SAVE_KEY,JSON.stringify(this.data));return true;}catch{this.error='This browser could not save. Export your progress in Grown-ups before closing.';return false;}}
 backupRaw(){return this.storage?.getItem(SAVE_KEY)||JSON.stringify(this.data);}
 import(raw:string){if(raw.length>4000000)throw Error('This file is too large. Choose a progress backup.');const v=migrateSave(JSON.parse(raw));if(!validateSave(v))throw Error('This is not a compatible Olivia progress file. Nothing was replaced.');this.storage?.setItem(`${SAVE_KEY}-backup`,this.backupRaw());this.data=v;this.error='';this.persist();}
 reset(){this.storage?.setItem(`${SAVE_KEY}-backup`,this.backupRaw());this.data=fresh();this.error='';this.persist();}
}
export function stats(save:Save,id:SkillId) {const attempts=save.attempts.filter(a=>a.skillId===id&&a.time>=(save.progress[id].resetAt||0));const recent=attempts.slice(-20);const independent=recent.filter(a=>a.initialIndependent??(!a.hint&&a.scaffoldDepth===0));const times=independent.filter(a=>a.firstTryCorrect&&a.latencyMs!==null).map(a=>a.latencyMs!).sort((a,b)=>a-b);return {attempts,recent,independent,accuracy:recent.length?recent.filter(a=>a.firstTryCorrect).length/recent.length:0,independentAccuracy:independent.length?independent.filter(a=>a.firstTryCorrect).length/independent.length:0,scaffoldRate:recent.length?recent.filter(a=>a.scaffoldDepth>0||a.hint).length/recent.length:0,median:times.length?times[Math.floor(times.length/2)]:null};}
/** Completed questions only. Older template versions are recognized by their equations. */
export function factEvidence(save:Save,id:SkillId,includeRelated=false) {
 const bank=factBank(id),lookup=new Map(bank.map(f=>[f.key,{fact:f,attempts:[] as Attempt[]}]));
 for(const a of save.attempts){
  if((!includeRelated&&a.skillId!==id)||a.time<(save.progress[a.skillId].resetAt||0))continue;
  const row=lookup.get(evidenceKey(a));if(row&&row.fact.answer===a.answer)row.attempts.push(a);
 }
 return [...lookup.values()];
}
export function factCoverage(save:Save,id:SkillId,includeRelated=false){
 const rows=factEvidence(save,id,includeRelated);
 const independent=rows.filter(r=>r.attempts.some(a=>a.firstTryCorrect&&!a.hint&&!a.scaffoldDepth));
 return {total:rows.length,seen:rows.filter(r=>r.attempts.length).length,independent:independent.length,
  bands:new Set(independent.map(r=>r.fact.band)).size,totalBands:new Set(rows.map(r=>r.fact.band)).size};
}
export class MasteryService {
 constructor(private save:SaveService){}
 status(id:SkillId,now=Date.now()):string {const s=this.save.data,p=s.progress[id];if(p.consolidated&&p.due<=now)return 'Review due';if(p.fluent)return 'Fluent';if(p.consolidated)return 'Consolidated';if(!skills.find(x=>x.id===id)!.prerequisites.every(k=>s.progress[k].consolidated))return 'Locked';return stats(s,id).attempts.length<5?'Introducing':'Practicing';}
 record(a:Attempt){const s=this.save.data;if(s.attempts.some(x=>x.id===a.id))return;s.attempts.push(a);if(s.attempts.length>5000){s.attempts.shift();s.summary.archived++;}const p=s.progress[a.skillId],all=stats(s,a.skillId).attempts;const independent=all.filter(x=>!x.hint&&x.scaffoldDepth===0),last=all.slice(-10),recent=all.slice(-20);const sessions=new Set(independent.map(x=>x.sessionId));
 const coverage=factCoverage(s,a.skillId);
 const varied=coverage.independent>=Math.min(10,coverage.total)&&coverage.bands>=Math.min(4,coverage.totalBands);
 const secure=varied&&independent.length>=10&&sessions.size>=2&&last.filter(x=>x.firstTryCorrect&&!x.hint&&!x.scaffoldDepth).length>=8&&all.slice(-5).filter(x=>!x.hint&&!x.scaffoldDepth).length>=4;
 const newly=secure&&!p.consolidated;if(newly){p.consolidated=true;p.due=a.time+DAY;p.interval=0;}
 const median=stats(s,a.skillId).median;if(varied&&p.consolidated&&independent.length>=20&&sessions.size>=3&&recent.filter(x=>x.firstTryCorrect&&!x.hint&&!x.scaffoldDepth).length>=18&&median!==null&&median<=5000)p.fluent=true;
 if(p.consolidated&&!newly){if(!a.firstTryCorrect||a.hint||a.scaffoldDepth){p.interval=Math.max(0,p.interval-1);p.due=a.time+DAY;}else if(p.due<=a.time){p.interval=Math.min(5,p.interval+1);p.due=a.time+[1,2,4,7,14,30][p.interval]*DAY;}}
 s.session.last=a.time;this.save.persist();}
 current():SkillId {const s=this.save.data;if(!s.settings.auto)return s.settings.manualSkill;const max=skills.findIndex(x=>x.id===s.settings.maxSkill);const available=skills.slice(0,max+1).filter(x=>x.prerequisites.every(k=>s.progress[k].consolidated));return available.find(x=>!s.progress[x.id].consolidated)?.id||available.at(-1)?.id||'N0';}
}
interface PracticeExposure {fact:Fact;correct?:boolean}
export class MathEngine {
 private random:()=>number;
 private owner:Save;
 private pending:{problem:Problem;resetAt:number}[]=[];
 constructor(private save:SaveService,seed=Date.now()){this.owner=save.data;this.random=rng(seed);}
 private history(id:SkillId):PracticeExposure[]{
  const s=this.save.data;
  if(this.owner!==s){this.owner=s;this.pending=[];}
  const completed=new Set(s.attempts.map(a=>`${a.skillId}:${a.templateId}:${a.seed}`));
  this.pending=this.pending.filter(({problem:p,resetAt})=>
   resetAt===(s.progress[p.skillId].resetAt||0)&&!completed.has(`${p.skillId}:${p.templateId}:${p.seed}`));
  const lookup=new Map(factBank(id).map(f=>[f.key,f])),history:PracticeExposure[]=[];
  for(const a of s.attempts){
   if(a.skillId!==id||a.time<(s.progress[id].resetAt||0))continue;
   const fact=lookup.get(evidenceKey(a));if(fact&&fact.answer===a.answer)
    history.push({fact,correct:a.firstTryCorrect&&!a.hint&&!a.scaffoldDepth});
  }
  // Unanswered screens count only until reload; they never become saved evidence.
  for(const {problem:p} of this.pending)if(p.skillId===id){
   const fact=lookup.get(evidenceKey(p));if(fact)history.push({fact});
  }
  return history;
 }
 private choose(candidates:readonly Fact[],history:PracticeExposure[]):Fact{
  const recent=history.slice(-3),previous=history.at(-1)?.fact;
  const prefer=(test:(f:Fact)=>boolean)=>{const filtered=candidates.filter(test);if(filtered.length)candidates=filtered;};
  prefer(f=>!recent.some(h=>h.fact.family===f.family));
  prefer(f=>f.family!==previous?.family);
  prefer(f=>f.key!==previous?.key);
  prefer(f=>!history.slice(-2).some(h=>h.fact.answer===f.answer));
  const lastBand=new Map<string,number>();history.forEach((h,i)=>lastBand.set(h.fact.band,i));
  const oldest=Math.min(...candidates.map(f=>lastBand.get(f.band)??-1));
  prefer(f=>(lastBand.get(f.band)??-1)===oldest);
  return candidates[Math.floor(this.random()*candidates.length)];
 }
 next(current:SkillId,index:number,context:Attempt['context']):Problem {
  const s=this.save.data;let selected=current;
  // An explicit focus and parent diagnostic always stay on the selected skill.
  const reviewSlot=(context==='practice'&&(index===3||index===4))||(context==='gate'&&index===1);
  if(s.settings.auto&&reviewSlot){
   const ceiling=Math.min(skills.findIndex(k=>k.id===current),skills.findIndex(k=>k.id===s.settings.maxSkill));
   const reviews=skills.slice(0,ceiling+1).filter(k=>k.id!==current&&s.progress[k.id].consolidated);
   const due=reviews.filter(k=>s.progress[k.id].due<=Date.now()),pool=due.length?due:reviews;
   const lastSeen=new Map<SkillId,number>();s.attempts.forEach((a,i)=>lastSeen.set(a.skillId,i));
   selected=pool.sort((a,b)=>(lastSeen.get(a.id)??-1)-(lastSeen.get(b.id)??-1))[0]?.id||current;
  }
  const bank=factBank(selected),history=this.history(selected);
  const counts=new Map<string,number>(),latest=new Map<string,{index:number;correct?:boolean}>();
  history.forEach((h,i)=>{counts.set(h.fact.key,(counts.get(h.fact.key)||0)+1);latest.set(h.fact.key,{index:i,correct:h.correct});});
  // At most one extra retry per four questions, after three intervening items.
  const retrySlot=history.length>=4&&history.length%4===0;
  const retries=retrySlot?bank.filter(f=>{const last=latest.get(f.key);return last?.correct===false&&history.length-last.index>=4;}):[];
  let chosen:Fact;
  if(retries.length){
   const oldest=Math.min(...retries.map(f=>latest.get(f.key)!.index));
   chosen=this.choose(retries.filter(f=>latest.get(f.key)!.index===oldest),history);
  }else{
   // Global least-exposure priority guarantees that no eligible fact is starved.
   const least=Math.min(...bank.map(f=>counts.get(f.key)||0));
   chosen=this.choose(bank.filter(f=>(counts.get(f.key)||0)===least),history);
  }
  const position=bank.indexOf(chosen),layout=Math.floor(this.random()*4);
  const cycle=Math.floor(this.random()*Math.floor(0x40000000/bank.length));
  const p=generate(selected,(cycle*bank.length+position)*4+layout);
  this.pending.push({problem:p,resetAt:s.progress[selected].resetAt||0});
  return p;
 }
}
export class SessionService {
 constructor(private save:SaveService,private mastery:MasteryService){}
 beginSession(){const s=this.save.data,now=Date.now();if(now-s.session.last>30*60000){s.session={id:`session-${now}`,started:now,last:now,newFamilies:[]};}this.save.persist();}
 start(quest:number){this.beginSession();this.save.data.active={id:`run-${Date.now()}`,quest,phase:'story',skill:this.mastery.current(),energy:1,collected:[],checkpoint:0,gateOpen:false,practiceDone:0,gateDone:0,rewarded:false,beads:[],design:[],charm:'star',levelRevision:LEVEL_REVISION};this.save.persist();}
 collect(id:number){const r=this.save.data.active!,pickup=pickupFor(r.quest,id);if(!pickup||r.collected.includes(id))return false;r.collected.push(id);r.beads.push(pickup.color);this.save.persist();return true;}
 rescue(){const s=this.save.data,r=s.active!;if(!r.rewarded){r.rewarded=true;if(!s.rescued.includes(quests[r.quest].animal))s.rescued.push(quests[r.quest].animal);if(!s.completed.includes(r.quest))s.completed.push(r.quest);}r.phase='studio';this.save.persist();}
 autoThread(){const r=this.save.data.active;if(!r||r.phase!=='studio'||r.braceletId)return;const used=new Set(r.design);for(let i=0;i<r.beads.length;i++)if(!used.has(i))r.design.push(i);this.save.persist();}
 finishBracelet(name:string){const s=this.save.data,r=s.active!;if(r.braceletId)return;const b:Bracelet={id:`bracelet-${r.id}`,name:name.trim().slice(0,40)||'Rainbow Friendship',beads:r.design.map(i=>r.beads[i]),charm:r.charm,time:Date.now()};if(!b.beads.length||b.beads.length!==r.beads.length||new Set(r.design).size!==r.beads.length||r.design.some(i=>!Number.isInteger(i)||i<0||i>=r.beads.length))throw Error('Place every bead first.');s.bracelets.push(b);s.worn=b.id;r.braceletId=b.id;r.phase='result';this.save.persist();}
}
export function validateContent(){if(new Set(skills.map(x=>x.id)).size!==skills.length)throw Error('Duplicate skill');for(const s of skills){if(s.prerequisites.some(x=>!skills.some(k=>k.id===x)))throw Error('Unknown prerequisite');for(let seed=0;seed<factBank(s.id).length*4;seed++)if(!validateProblem(generate(s.id,seed)))throw Error('Invalid generated item');}}

