import type {Problem,SkillId} from './core';
import {isExpansion,expansionBank} from './expansion';

export interface Fact {
 a:number;b:number;answer:number;kind:Problem['kind'];prompt:string;family:string;
 /** Ordered equations have separate identities; commuted sums share a family. */
 key:string;band:string;help?:string;choices?:string[];story?:string;
}

export function eligibleFact(id:SkillId,a:number,b:number):boolean {
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0)return false;
 if(isExpansion(id))return expansionBank(id).some(f=>f.a===a&&f.b===b);
 const sum=a+b;
 switch(id){
  case 'N0':return a<=5&&b===0;
  case 'N1':case 'A1':return sum<=5;
  case 'A2':return sum<=10&&Math.min(a,b)<=2;
  case 'A3':return a===b&&a>=1&&a<=5;
  case 'A4':return sum<=10;
  case 'A5':return Math.max(a,b)>=10&&sum<20;
  case 'A6':return a<10&&b<10&&sum>10;
  case 'A7':return sum<=20;
  case 'S1':return a<=5&&b<=a;
  case 'S2':return a<=10&&b<=Math.min(2,a);
  case 'S3':return a<=10&&b<=a;
  case 'S4':return a>10&&a<20&&b<=a-10;
  case 'S5':return a>10&&a<20&&b<10&&b<=a&&a-b<10;
  case 'S6':return a<=20&&b<=a;
 }
}

function bandFor(a:number,b:number,kind:Problem['kind']):string {
 if(kind==='quantity')return 'quantity';
 if(kind==='subtract'){
  if(b===0)return 'subtract-zero';
  if(a===b)return 'take-all';
  if(b<=2)return 'count-back';
  if(b===10)return 'subtract-ten';
  if(a>10)return a-b<10?'cross-ten':'keep-ten';
  return a===10?'from-ten':'within-ten';
 }
 if(a===0||b===0)return 'add-zero';
 if(a===b)return 'doubles';
 if(Math.abs(a-b)===1)return 'near-doubles';
 if(a+b===10)return 'make-ten';
 if(a<10&&b<10&&a+b>10)return 'cross-ten';
 return a+b>10?'tens-and-ones':'within-ten';
}

const banks=new Map<SkillId,readonly Fact[]>();
/** Exhaustive finite banks, rather than nested random ranges that bias operands. */
export function factBank(id:SkillId):readonly Fact[] {
 if(isExpansion(id))return expansionBank(id);
 const cached=banks.get(id);if(cached)return cached;
 const kind:Problem['kind']=id==='N0'?'quantity':id==='N1'?'compose':id.startsWith('S')?'subtract':'add';
 const result:Fact[]=[];
 for(let a=0;a<=20;a++)for(let b=0;b<=20;b++){
  if(!eligibleFact(id,a,b))continue;
  const answer=kind==='subtract'?a-b:a+b,op=kind==='subtract'?'−':'+';
  result.push(Object.freeze({a,b,answer,kind,
   key:kind==='quantity'?`count:${a}`:`${a}${op}${b}`,
   prompt:kind==='quantity'?'How many beads?':`${a} ${op} ${b} = ?`,
   family:kind==='subtract'?`sub:${a}:${b}:${answer}`:`${Math.min(a,b)}:${Math.max(a,b)}:${answer}`,
   band:bandFor(a,b,kind)}));
 }
 banks.set(id,Object.freeze(result));return banks.get(id)!;
}

/** Read old evidence from its displayed equation, not a seed from an older generator. */
export function evidenceKey(a:{skillId:SkillId;prompt:string;answer:number;story?:string}):string {
 if(isExpansion(a.skillId))return expansionBank(a.skillId).find(f=>f.prompt===a.prompt&&f.story===a.story&&f.answer===a.answer)?.key||'';
 if(a.skillId==='N0')return `count:${a.answer}`;
 const match=/^(\d+)\s*([+−-])\s*(\d+)\s*=\s*\?$/.exec(a.prompt);
 return match?`${Number(match[1])}${match[2]==='+'?'+':'−'}${Number(match[3])}`:'';
}
