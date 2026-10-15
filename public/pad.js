// Math Arcade v0.8.3 — one directional pad for every Arcade game (handbook U-17, U-10).
// Layouts (owner, 2026-10-15):
//  'cross' — the Mega Man Math pad: up above, down below, left and right meeting in the middle.
//  'eight' — the same pad with arrows in all four corners: a full 3 × 3 of directions, no empty cells.
// The pad is ONE held-input zone; the direction is read from where the finger is, so sliding between
// arrows changes direction without lifting. Contact ownership, release and interruption handling come
// from the shared MathQuest held-input module (U-10), never a copy.
import {bindHeldInput,pointInside} from '/coastal/engine/held-input.js?v=1';
import {controlMarkup,bindGameInput} from '/coastal/engine/controls.js';

const CELLS={
 cross:[['up','▲','Up'],['left','◀','Left'],['right','▶','Right'],['down','▼','Down']],
 eight:[['up-left','◤','Up and left'],['up','▲','Up'],['up-right','◥','Up and right'],['left','◀','Left'],['right','▶','Right'],['down-left','◣','Down and left'],['down','▼','Down'],['down-right','◢','Down and right']]
};
const DIRS=['up','down','left','right'];
const isPad=profile=>!!profile?.pad&&profile.left?.length===4&&DIRS.every(d=>profile.left.some(([k])=>k===d));

// Direction under a point. x,y are relative to the pad box (w × h). Outside a 25% margin the finger has
// left the pad, so no direction is held.
export function padDirection(mode,x,y,w,h){
 if(x<-.25*w||x>1.25*w||y<-.25*h||y>1.25*h)return {};
 const nx=Math.min(.999,Math.max(0,x/w)),ny=Math.min(.999,Math.max(0,y/h));
 const col=nx<1/3?0:nx<2/3?1:2,row=ny<1/3?0:ny<2/3?1:2,out={};
 if(row===1){out[nx<.5?'left':'right']=true;return out;}
 if(mode==='eight'){out[row===0?'up':'down']=true;if(col===0)out.left=true;if(col===2)out.right=true;return out;}
 if(col===1){out[row===0?'up':'down']=true;return out;}
 // Cross corners are not drawn; a finger there goes to the nearer arm so it is never "dead".
 const dx=nx-.5,dy=ny-.5;if(Math.abs(dx)>Math.abs(dy))out[dx<0?'left':'right']=true;else out[dy<0?'up':'down']=true;return out;
}

export function padMarkup(profile){
 if(!isPad(profile))return controlMarkup(profile);
 const mode=profile.pad==='eight'?'eight':'cross',label=key=>profile.left.find(([k])=>k===key)?.[1]||key;
 const cells=CELLS[mode].map(([key,glyph,name])=>`<span class="ap-cell ap-${key}" data-pad-cell="${key}" aria-hidden="true">${glyph}</span>`).join('');
 const names=DIRS.map(d=>label(d)).join(', ');
 const actions=profile.right.map(([key,text],i)=>`<button type="button" class="${i<2?'ap-round':'ap-small'}" data-game-key="${key}" aria-label="${text}">${text}</button>`).join('');
 return `<div class="ap-bar"><div class="ap-pad ap-${mode}" data-ap-pad role="group" aria-label="${mode==='eight'?'8-direction pad':'Direction pad'}: ${names}">${cells}</div><div class="ap-actions ap-n${profile.right.length}">${actions}</div></div>`;
}

export function bindPadInput(root,profile,options){
 if(!isPad(profile))return bindGameInput(root,profile,options);
 const mode=profile.pad==='eight'?'eight':'cross',pad=root.querySelector('[data-ap-pad]'),buttons=[...root.querySelectorAll('.ap-actions [data-game-key]')],cells=[...pad.querySelectorAll('[data-pad-cell]')];
 const zones=[{element:pad,read:point=>{const r=pad.getBoundingClientRect();return padDirection(mode,point.clientX-r.left,point.clientY-r.top,r.width,r.height);}},
  ...buttons.map(element=>({element,read:point=>pointInside(point,element)?{[element.dataset.gameKey]:true}:{}}))];
 return bindHeldInput(root,{...options,keys:profile.keys,
  blocked:()=>options.blocked?.()||!!globalThis.matchMedia?.('(orientation: portrait) and (max-width: 700px)').matches,
  zones,
  onChange:value=>{
   for(const c of cells){const k=c.dataset.padCell,parts=k.split('-');c.classList.toggle('held',parts.length===2?parts.every(p=>value[p]):!!value[k]&&(mode!=='eight'||!DIRS.some(d=>value[d]&&['up','down'].includes(k)!==['up','down'].includes(d))));}
   for(const b of buttons)b.classList.toggle('held',!!value[b.dataset.gameKey]);
   options.onChange(value);
  }
 });
}
