import {catalog,checkAnswer,keypadKeys,gradeLabel,type MathSkill} from './catalog';
import {formatMath} from '../math-format';

export const searchSkills=(query:string,lo:number,hi:number)=>{
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return catalog.filter(s=>terms.length?terms.every(t=>`${s.name} ${s.id} ${s.standard} ${/time|elapsed|midnight|notation/.test(s.id)?'time clock hours minutes':''}`.toLowerCase().includes(t)):s.grade>=lo&&s.grade<=hi);
};
export const previewSkills=(ids:Iterable<string>)=>{const selected=new Set(ids);return catalog.filter(s=>selected.has(s.id));};

/** Preview owns only transient DOM/items; it never receives a learner state. */
export function openPreview(root:HTMLElement,skills:MathSkill[]){
 let index=0,answer='',question=skills[0].make();
 const close=()=>{root.replaceChildren();root.hidden=true;document.getElementById('diagnostic')?.focus();};
 const draw=()=>{
  root.hidden=false;root.innerHTML=`<section class="math-preview" aria-label="Skill preview"><div class="preview-reading"><div class="row"><strong>Preview ${index+1} of ${skills.length}</strong><button id="preview-close">Close preview</button></div><p id="preview-skill"></p><div id="preview-question">${formatMath(question.prompt)}</div><p class="note">Preview only — student progress and current gates are unchanged.</p></div><div class="preview-entry"><label>Answer<input id="preview-answer" readonly inputmode="none" autocomplete="off"></label><div id="preview-answer-format" aria-hidden="true"></div><div id="preview-keypad"></div><div class="row"><button id="preview-submit">Check answer</button><button id="preview-next">${index+1===skills.length?'Finish preview':'Next skill'}</button></div><p id="preview-feedback" role="status"></p></div></section>`;
  root.querySelector('#preview-skill')!.textContent=`Grade ${gradeLabel(skills[index].grade)} · ${skills[index].name} (${skills[index].standard})`;
  const input=root.querySelector<HTMLInputElement>('#preview-answer')!;
  const enter=(key:string)=>{if(key==='back')answer=answer.slice(0,-1);else if(key==='clear')answer='';else if(key==='AM'||key==='PM')answer=answer.replace(/\s*(?:AM|PM)$/i,'').trimEnd()+' '+key;else if(answer.length<80)answer+=key;input.value=answer;root.querySelector('#preview-answer-format')!.innerHTML=formatMath(answer);};
  const check=()=>{root.querySelector('#preview-feedback')!.textContent=!answer.trim()?'Enter an answer.':checkAnswer(question,answer)?'Correct.':'Try again. Fractions must be reduced.';};
  const keys=keypadKeys(question.type);root.querySelector<HTMLElement>('#preview-keypad')!.style.gridTemplateColumns=`repeat(${keys.length>20?5:4},minmax(0,1fr))`;
  for(const key of keys){const b=document.createElement('button');b.type='button';b.textContent=({back:'⌫',clear:'Clear',' ':'Space'} as Record<string,string>)[key]||key;b.setAttribute('aria-label',key==='back'?'Backspace':b.textContent);b.onclick=()=>enter(key);root.querySelector('#preview-keypad')!.append(b);}
  root.querySelector<HTMLButtonElement>('#preview-submit')!.onclick=check;
  root.querySelector<HTMLButtonElement>('#preview-close')!.onclick=close;
  root.querySelector<HTMLButtonElement>('#preview-next')!.onclick=()=>{if(++index===skills.length){close();return;}answer='';question=skills[index].make();draw();};
  root.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab'||e.ctrlKey||e.metaKey||e.altKey)return;const key=e.key;if(key==='Enter'&&e.target===input){e.preventDefault();check();}else if(key==='Backspace'||key==='Delete'||/^[0-9a-zA-Z.,/:+−\-*=<>≤≥^() ]$/.test(key)&&!(key===' '&&e.target instanceof HTMLButtonElement)){e.preventDefault();e.stopPropagation();enter(key==='Backspace'?'back':key==='Delete'?'clear':key);}};
  input.focus({preventScroll:true});root.scrollIntoView?.({block:'start'});
 };
 draw();
}
