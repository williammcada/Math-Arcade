import type {Problem,Scaffold} from './core';
import {isExpansion} from './expansion';
const bead=(i:number,color:string,extra='')=>'<button class="bead count-bead" data-n="'+i+'" style="--bead:'+color+'" aria-label="Bead '+(i+1)+'" '+extra+'></button>';
function frames(count:number,pink:number,capacity:number,render?:(i:number)=>string){
 const rows=Math.ceil(capacity/10);let html='<div class="ten-frames">';
 for(let f=0;f<rows;f++){html+='<div class="frame" aria-label="'+(capacity>10?'Ten-frame '+(f+1):'Counting frame')+'">';for(let j=0;j<Math.min(10,capacity-f*10);j++){const i=f*10+j;html+='<div class="slot" data-slot="'+i+'">'+(render?render(i):i<count?bead(i,i<pink?'#f27fa6':'#67c8f0'):'')+'</div>';}html+='</div>';}
 return html+'</div>';
}
export function mathModel(p:Problem,step:Scaffold|null,visual:boolean){
 if(isExpansion(p.skillId))return '';
 if(!visual)return '<p class="count-note">Lumi is here if you need a hand.</p>';
 const guided=step&&step.mode!=='original',capacity=Math.max(p.a,p.answer)>10?20:Math.max(p.a,p.answer)>5?10:5;
 if(p.kind==='subtract'){
  const remaining=step?.mode==='remaining',take=(!step||step.mode==='take'||step.mode==='original');
  return frames(p.a,p.a,capacity,i=>i>=p.a?'':remaining&&i<p.b?'<span class="bead removed" style="--bead:#f27fa6" aria-label="Taken away"></span>':bead(i,'#f27fa6',take?'data-remove="true" aria-pressed="false"':''))+
   '<p class="model-label">'+(remaining?p.b+' crossed out · count what remains':take?'Tap '+p.b+' beads to cross them out.':'Start with the whole group.')+'</p>';
 }
 if(step?.mode==='make-ten')return frames(10,p.a,10,i=>i<p.a?'<span class="bead fixed-part" style="--bead:#f27fa6"></span>':bead(i,'#67c8f0','data-fill="true"'))+'<p class="model-label">'+p.a+' already here · fill the empty part to make 10</p>';
 if(step?.mode==='rest')return frames(step.count,0,step.count>5?10:5)+'<p class="model-label">Ten is ready. Count the blue beads left to add.</p>';
 if(p.kind==='compose'&&!guided){const groups=[p.a,p.b].map((n,g)=>'<div class="bead-group">'+(Array.from({length:n},(_,i)=>bead(i+(g?p.a:0),g?'#67c8f0':'#f27fa6','draggable="true"')).join('')||'<b>0</b>')+'</div>').join('<b>+</b>');return '<div class="groups">'+groups+'</div>'+frames(0,0,5);}
 const count=guided?step.count:p.answer,pink=guided&&step.mode==='part-b'?0:Math.min(p.a,count);
 if(guided||p.layout===1||capacity===20)return frames(count,pink,capacity);
 return '<div class="groups"><div class="bead-group">'+(Array.from({length:pink},(_,i)=>bead(i,'#f27fa6')).join('')||'<b>0</b>')+'</div>'+(p.kind==='quantity'?'':'<b>+</b><div class="bead-group">'+(Array.from({length:count-pink},(_,i)=>bead(i+pink,'#67c8f0')).join('')||'<b>0</b>')+'</div>')+'</div>';
}
