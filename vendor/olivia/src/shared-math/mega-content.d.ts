export interface Item {prompt:string;answer:string|number;type:string;skillId?:string}
export interface MathSkill {grade:number;id:string;name:string;standard:string;make:()=>Item;prereq?:string;optional24?:boolean}
export const Skills:{list:MathSkill[];check:(item:Item,response:string)=>boolean;value:(text:string|number)=>number;polynomial:(text:string)=>number[]|null;clock:(n:number)=>string;ampm:(n:number)=>string};
