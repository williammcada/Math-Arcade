import type {MathSkill} from './catalog';
const clock=(n:number)=>`${Math.floor(n/60)%12||12}:${String(n%60).padStart(2,'0')} ${n<720?'AM':'PM'}`;
export function quarterTimeItem(start:number,duration:number,forward:boolean){
 const h=Math.floor(duration/60),m=duration%60;
 const words=[h?`${h} hour`:'',m?`${m} minutes`:''].filter(Boolean).join(' ');
 return {prompt:`What time is ${words} ${forward?'after':'before'} ${clock(forward?start:start+duration)}? Enter h:mm AM or PM.`,answer:clock(forward?start+duration:start),type:'time12'};
}
export const quarterTime:MathSkill={id:'g3-time-quarter',grade:3,name:'Find start/end times: 15-minute steps',standard:'3.MD.A.1 textual component',prereq:'g2-time',make:()=>quarterTimeItem((24+Math.floor(Math.random()*49))*15,(1+Math.floor(Math.random()*7))*15,Math.random()<.5)};
