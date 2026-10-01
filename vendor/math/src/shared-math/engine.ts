import {catalog,checkAnswer,type Item} from './catalog';
export interface Config {mode:'general'|'targeted'|'progression';lo:number;hi:number;count:number;selected:string[];include24:boolean}
export interface MathEvent {time:number;type:string;skill?:string;correct?:boolean;attempt?:number;response?:string;prompt?:string;answer?:string;from?:string;to?:string;context?:string}
export interface Gate {context:string;runId:string;config:Config;completed:number;item:Item&{skillId:string};attempts:number;bag:string[]}
export interface MathState {version:1;config:Config;history:Record<string,boolean[]>;position:string|null;returnTo:string[];events:MathEvent[];gate:Gate|null;resetSequence:boolean;note:string}
export const pool=(c:Config)=>catalog.filter(s=>s.grade>=c.lo&&s.grade<=c.hi&&(c.mode==='targeted'?c.selected.includes(s.id):!s.optional24||c.include24));
export function configError(c:Config):string {
 if(!c||!['general','targeted','progression'].includes(c.mode)||!Number.isInteger(c.lo)||!Number.isInteger(c.hi)||c.lo<0||c.hi>7||c.lo>c.hi)return 'Choose a valid grade range from K to 7.';
 if(!Number.isInteger(c.count)||c.count<1||c.count>10)return 'Choose 1–10 questions per gate.';
 if(typeof c.include24!=='boolean'||!Array.isArray(c.selected)||!c.selected.every(id=>catalog.some(s=>s.id===id)))return 'Choose valid skills.';
 return pool(c).length?'':'Select at least one skill in the chosen grade range.';
}
export function freshMath(manual='S01',automatic=false,maximum='F01'):MathState {
 const chosen=catalog.find(s=>s.id===manual)||catalog.find(s=>s.id==='S01')!;
 return {version:1,config:{mode:automatic?'progression':'targeted',lo:automatic?0:chosen.grade,hi:automatic?(catalog.find(s=>s.id===maximum)?.grade??chosen.grade):chosen.grade,count:5,selected:[chosen.id],include24:false},history:{},position:null,returnTo:[],events:[],gate:null,resetSequence:false,note:''};
}
export function validMath(s:MathState):boolean {try{
 const known=(id:unknown)=>typeof id==='string'&&catalog.some(x=>x.id===id);
 const small=(v:unknown)=>typeof v==='string'&&v.length<=4000;
 return s.version===1&&!configError(s.config)&&typeof s.resetSequence==='boolean'&&small(s.note)&&
 (s.position===null||known(s.position))&&Array.isArray(s.returnTo)&&s.returnTo.length<=catalog.length&&s.returnTo.every(known)&&
 !!s.history&&typeof s.history==='object'&&!Array.isArray(s.history)&&Object.entries(s.history).every(([id,h])=>known(id)&&Array.isArray(h)&&h.length<=10&&h.every(v=>typeof v==='boolean'))&&
 Array.isArray(s.events)&&s.events.length<=5000&&s.events.every(e=>Number.isFinite(e.time)&&small(e.type)&&(e.skill===undefined||known(e.skill))&&(e.correct===undefined||typeof e.correct==='boolean')&&(e.attempt===undefined||Number.isInteger(e.attempt)&&e.attempt>=1)&&['response','prompt','answer','context','from','to'].every(k=>(e as any)[k]===undefined||small((e as any)[k])))&&
 (s.gate===null||(!configError(s.gate.config)&&small(s.gate.context)&&small(s.gate.runId)&&Number.isInteger(s.gate.completed)&&s.gate.completed>=0&&s.gate.completed<s.gate.config.count&&Number.isInteger(s.gate.attempts)&&s.gate.attempts>=0&&Array.isArray(s.gate.bag)&&s.gate.bag.length<=catalog.length&&s.gate.bag.every(id=>pool(s.gate!.config).some(x=>x.id===id))&&known(s.gate.item.skillId)&&small(s.gate.item.prompt)&&small(s.gate.item.type)&&['string','number'].includes(typeof s.gate.item.answer)&&checkAnswer(s.gate.item,String(s.gate.item.answer))));
 }catch{return false}}
export class Practice {
 constructor(public state:MathState,private persist:()=>void=()=>{}){}
 log(type:string,extra:Partial<MathEvent>={}){this.state.events.push({time:Date.now(),type,...extra});if(this.state.events.length>5000)this.state.events.shift();}
 saveConfig(config:Config){const err=configError(config);if(err)throw Error(err);const s=this.state;const changed=['mode','lo','hi','include24'].some(k=>(s.config as any)[k]!==(config as any)[k]);s.config=structuredClone(config);s.resetSequence=s.resetSequence||changed;this.log('settings-changed');this.persist();}
 open(context:string,runId:string){const s=this.state;if(s.gate&&s.gate.context===context&&s.gate.runId===runId)return s.gate;
 if(s.resetSequence){s.position=null;s.returnTo=[];s.resetSequence=false;}
 s.gate={context,runId,config:structuredClone(s.config),completed:0,attempts:0,bag:[],item:{prompt:'',answer:0,type:'number',skillId:''}};this.log('gate-open',{context});this.next();return s.gate!;}
 next(){const s=this.state,g=s.gate!;const eligible=pool(g.config);let id:string;
 if(g.config.mode==='progression'){
  if(!s.position||!catalog.some(x=>x.id===s.position)||(!s.returnTo.length&&!eligible.some(x=>x.id===s.position)))s.position=eligible[0].id;
  id=s.position;
 }else{if(!g.bag.length){g.bag=eligible.map(x=>x.id);for(let i=g.bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[g.bag[i],g.bag[j]]=[g.bag[j],g.bag[i]];}}id=g.bag.shift()!;}
 const skill=catalog.find(x=>x.id===id)!;g.item={...skill.make(),skillId:id};g.attempts=0;this.persist();}
 first(correct:boolean){const s=this.state,g=s.gate!,id=g.item.skillId,h=s.history[id]||=[];h.push(correct);if(h.length>10)h.shift();this.log('first-attempt',{skill:id,correct});
 if(g.config.mode!=='progression'||h.length<10)return;
 const accuracy=h.filter(Boolean).length/10,eligible=pool(g.config);
 if(accuracy>=.8){s.position=s.returnTo.length?s.returnTo.pop()!:eligible[Math.min(eligible.findIndex(x=>x.id===id)+1,eligible.length-1)].id;this.log('advance',{from:id,to:s.position});s.history[id]=[];}
 else if(accuracy<.5){const p=catalog.find(x=>x.id===id)?.prereq;if(p){s.returnTo.push(id);s.position=p;s.history[id]=[];s.history[p]=[];this.log('step-back',{from:id,to:p});}}
 }
 submit(response:string){const g=this.state.gate;if(!g||!response.trim())return {correct:false,complete:false};const correct=checkAnswer(g.item,response);if(g.attempts===0)this.first(correct);g.attempts++;
 this.log('answer',{skill:g.item.skillId,correct,attempt:g.attempts,response,prompt:g.item.prompt,answer:String(g.item.answer),context:g.context});
 if(correct){g.completed++;if(g.completed>=g.config.count){this.log('gate-complete',{context:g.context});this.state.gate=null;this.persist();return {correct:true,complete:true};}this.next();}this.persist();return {correct,complete:false};}
 override(){if(!this.state.gate)return;this.log('adult-override',{context:this.state.gate.context});this.state.gate=null;this.persist();}
 resetSkill(id:string){delete this.state.history[id];this.state.events=this.state.events.filter(e=>e.skill!==id&&e.from!==id&&e.to!==id);this.state.position=null;this.state.returnTo=[];this.persist();}
}
