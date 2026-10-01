import type {Fact} from './facts';

export const expansionSkills = [
 ['S01','Two-digit subtraction with one regrouping','Trade one ten for ten ones. Subtract the ones, then the tens.'],
 ['S02','Subtracting from a multiple of ten','Trade one ten for ten ones before subtracting.'],
 ['S03','Three-digit subtraction without regrouping','Subtract ones, tens, and hundreds in their matching places.'],
 ['S04','Three-digit subtraction with one regrouping','Regroup only where the top digit is too small.'],
 ['S05','Three-digit subtraction with two regroupings','Work from ones to hundreds, updating each place after a trade.'],
 ['S06','Subtraction across zeros','Trade from the first nonzero place to the left, passing through the zero.'],
 ['S07','Four-digit subtraction with regrouping','Keep ones, tens, hundreds, and thousands aligned.'],
 ['N01','Addition with regrouping','Add ones first. Trade each group of ten for one in the next place.'],
 ['N02','Place value through thousands','Each place is ten times the value of the place to its right.'],
 ['N03','Comparing and ordering numbers','Compare the largest place first. Continue right if the digits match.'],
 ['N04','Missing-number equations','Use addition to undo subtraction, or subtraction to undo addition.'],
 ['N05','Addition and subtraction stories','Decide whether you need a total, a difference, or a missing starting amount.'],
 ['M01','Multiplication as equal groups','Add the same group size once for each group.'],
 ['M02','Multiplication facts: 2, 5, 10, 3 and 4','Use known facts or count in equal steps.'],
 ['M03','Division: sharing and grouping','Find the multiplication fact that makes the total.'],
 ['M04','Multiplication and division families','Use the same two factors and their product.'],
 ['F01','Simple fractions','Fractions refer to equal-sized wholes. A larger denominator means smaller equal parts.'],
] as const;
export type ExpansionId = typeof expansionSkills[number][0];
export const isExpansion = (id:string):id is ExpansionId => expansionSkills.some(s=>s[0]===id);
export const numberText=(n:number)=>n.toLocaleString('en-US');

/** Count actual trades after earlier trades have changed the next column. */
export function regrouping(a:number,b:number){
 let borrow=0,count=0,acrossZero=false;
 while(a||b){const top=a%10,bottom=b%10;if(top-borrow<bottom){count++;if(top===0)acrossZero=true;borrow=1;}else borrow=0;a=Math.floor(a/10);b=Math.floor(b/10);}
 return {count,acrossZero};
}
const cache=new Map<string,readonly Fact[]>();
export function expansionBank(id:ExpansionId):readonly Fact[]{
 const cached=cache.get(id);if(cached)return cached;
 const items:Fact[]=[];
 const add=(a:number,b:number,answer:number,prompt:string,band:string,help:string,choices?:string[],story?:string)=>{
  if(items.some(f=>f.prompt===prompt&&f.story===story))return;
  const key=`${id}:${story||''}:${prompt}`;
  items.push({a,b,answer,prompt,kind:'text',key,family:key,band,help,choices,story});
 };
 const arithmetic=(a:number,b:number,subtract=true)=>{
  const r=regrouping(a,b),answer=subtract?a-b:a+b;
  const help=subtract?`${expansionSkills.find(s=>s[0]===id)![2]} Check by adding your difference to ${numberText(b)}. It should make ${numberText(a)}.`:'Add the ones first, then tens, then hundreds. Carry each complete ten into the next place.';
  add(a,b,answer,`${numberText(a)} ${subtract?'−':'+'} ${numberText(b)} = ___`,`${r.count}:${Math.floor(answer/10)%4}`,help);
 };
 if(id.startsWith('S')){
  const digits=id==='S01'||id==='S02'?2:id==='S07'?4:3;
  const min=10**(digits-1),max=10**digits-1;
  const eligible=(a:number,b:number)=>{const r=regrouping(a,b);return a>=min&&b>=min&&a<=max&&b<=a&&(
   id==='S01'?a%10!==0&&r.count===1:
   id==='S02'?a%10===0&&r.count===1:
   id==='S03'?r.count===0:
   id==='S04'?r.count===1&&!r.acrossZero:
   id==='S05'?r.count===2&&!r.acrossZero:
   id==='S06'?r.acrossZero:r.count>0);};
  const anchors:Record<string,[number,number][]>={S01:[[52,27],[71,46],[83,58]],S02:[[60,24],[70,36]],S03:[[456,123]],S04:[[452,127],[452,182]],S05:[[632,247]],S06:[[402,185],[700,346]],S07:[[3204,1786],[9999,1111],[1000,999]]};
  for(const [a,b] of anchors[id]||[])if(eligible(a,b))arithmetic(a,b);
  // A bounded, reproducible bank keeps coverage and local evidence responsive.
  let seed=197+expansionSkills.findIndex(s=>s[0]===id);
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let tries=0;items.length<160&&tries<100000;tries++){
   const a=min+Math.floor(rand()*(max-min+1)),b=min+Math.floor(rand()*(a-min+1));
   if(eligible(a,b))arithmetic(a,b);
  }
 }else if(id==='N01'){
  for(let a=28;a<=928;a+=37)for(let b=17;b<=317;b+=43)if(a%10+b%10>=10||Math.floor(a/10)%10+Math.floor(b/10)%10>=10)arithmetic(a,b,false);
 }else if(id==='N02'){
  for(const a of [120,305,840,1006,2345,3406,5070,6809,9021])for(const place of [1,10,100,1000]){
   if(place>a)continue;const digit=Math.floor(a/place)%10,value=digit*place,name=({1:'ones',10:'tens',100:'hundreds',1000:'thousands'} as Record<number,string>)[place];
   add(a,place,value,`What is the value of the ${name} digit in ${numberText(a)}?`,'value',`${digit} in the ${name} place means ${digit} × ${numberText(place)}.`);
   add(a,place,value,`${numberText(a)} = ${numberText(a-value)} + ___`,'expand','Break the number into its place values. Find the missing part.');
  }
  add(3406,0,3406,'Write three thousand four hundred six in digits.','read','Combine 3,000, 400, and 6.');
  add(5070,0,5070,'Write five thousand seventy in digits.','read','There are 5 thousands, no hundreds, 7 tens, and no ones.');
 }else if(id==='N03'){
  for(const a of [48,109,305,999,1006,3406,5070,9021])for(const delta of [-10,0,1,10]){
   const b=a+delta;add(a,b,a<b?0:a===b?1:2,`${numberText(a)} ___ ${numberText(b)}`,'compare','Compare digits from the greatest place to the smallest.',['<','=','>']);
   if(delta!==0){const c=a+20;add(a,b,0,'Choose the numbers in order, smallest first.','order','Find the smallest number first, then compare the other two.',[...new Set([[a,b,c].sort((x,y)=>x-y).map(numberText).join(', '),[c,a,b].map(numberText).join(', '),[a,c,b].map(numberText).join(', ')])]);}
  }
 }else if(id==='N04'||id==='N05'){
  for(let a=23;a<180;a+=19)for(let b=12;b<80;b+=17){const total=a+b;
   if(id==='N04'){
    add(a,b,b,`${a} + ___ = ${total}`,'missing-addend',`Subtract ${a} from ${total}.`);
    add(a,b,total,`___ − ${b} = ${a}`,'missing-start',`Add ${a} and ${b} to find the starting amount.`);
    add(a,b,b,`${total} − ___ = ${a}`,'missing-change',`Find the difference between ${total} and ${a}.`);
   }else{
    add(a,b,total,'How many stickers does she have now?','join','Add the starting amount and the extra amount.',undefined,`Olivia has ${a} stickers. She gets ${b} more.`);
    add(total,b,a,'How many cards are left?','separate','Subtract the amount given away from the starting amount.',undefined,`Olivia has ${total} cards. She gives away ${b}.`);
    add(total,a,b,'How many more does Olivia have?','compare','Find the difference between their amounts.',undefined,`Olivia has ${total} shells. Sam has ${a}.`);
    add(a,b,total,'How many did she start with?','start','Add what was given away to what remains.',undefined,`Olivia gives away ${b} stickers. She has ${a} left.`);
   }
  }
 }else if(id.startsWith('M')){
  for(const a of [2,5,10,3,4])for(let b=1;b<=10;b++){
   const product=a*b,help=`Use ${a} × ${b} = ${product}.`;
   if(id==='M01')add(a,b,product,`${a} × ${b} = ___`,'groups','Add the group size once for each bag.',undefined,`${a} bags hold ${b} marbles each. How many marbles altogether?`);
   if(id==='M02')add(a,b,product,`${a} × ${b} = ___`,`table-${a}`,`Count in steps of ${a}, ${b} times.`);
   if(id==='M03'){
    add(product,a,b,`${product} ÷ ${a} = ___`,'sharing',help,undefined,`${product} cookies are shared equally among ${a} children. How many does each get?`);
    add(product,b,a,`${product} ÷ ${b} = ___`,'grouping',help,undefined,`${product} cookies go into bags of ${b}. How many bags?`);
   }
   if(id==='M04'){
    add(a,b,product,`${b} × ${a} = ___`,'multiply',help,undefined,`Use the fact family ${a}, ${b}, ${product}.`);
    add(product,a,b,`${product} ÷ ${a} = ___`,'divide',help,undefined,`Use the fact family ${a}, ${b}, ${product}.`);
   }
  }
 }else if(id==='F01'){
  const fractions=[[1,2,'one half'],[1,3,'one third'],[1,4,'one fourth'],[2,3,'two thirds'],[3,4,'three fourths']] as const;
  for(const [a,b,name] of fractions){
   const choices=fractions.map(f=>`${f[0]}/${f[1]}`);
   add(a,b,choices.indexOf(`${a}/${b}`),`Choose ${name}.`,'name','The numerator tells how many parts; the denominator tells how many equal parts in one whole.',choices);
   for(const [c,d] of fractions)add(a,b,a*d<c*b?0:a*d===c*b?1:2,`${a}/${b} ___ ${c}/${d}`,'compare','Compare fractions of equal-sized wholes. Think about halves and the size and number of the equal parts.',['<','=','>']);
  }
 }
 // Rotate option order deterministically so correct options do not all occupy one position.
 items.forEach((f,i)=>{if(f.choices){const offset=i%f.choices.length;f.choices=[...f.choices.slice(offset),...f.choices.slice(0,offset)];f.answer=(f.answer-offset+f.choices.length)%f.choices.length;}Object.freeze(f);});
 cache.set(id,Object.freeze(items));return cache.get(id)!;
}
