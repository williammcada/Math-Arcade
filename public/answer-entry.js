// Math Arcade answer entry (v0.10.0, handbook U-18). One helper for every screen that takes a math answer:
// the main gate, the adventure gate (Chrono, Olivia) and the Kingsgate question round.
//   keypad questions → the Math Engine's universal answer pad (/answer-pad.js, built from MATH-ENGINE src/answer-pad.js)
//   choice questions → answer buttons
//   text questions   → a normal text box (words, letters, Roman numerals)
// The Arcade only places and sizes the pad; its keys, order and tabs belong to the Engine.
import AnswerPad from '/answer-pad.js';

let current=null; // one answer area per page; a new question replaces the old pad and its keyboard listener

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/**
 * container   – element that receives the pad or the choice buttons
 * input       – the answer box (its value is what the screen submits)
 * form        – the screen's form; Enter on a physical keyboard submits it
 * gate        – the question as sent by the server ({inputMode, choices})
 * choiceClass – class for the choice-button area (keeps each screen's existing look)
 * value       – starting text (a saved draft or the answer kept after a wrong try)
 */
export function mountAnswerEntry({container,input,form,gate,choiceClass='keypad',value=''}){
 current?.destroy();
 const mode=gate.inputMode==='choice'?'choice':gate.inputMode==='keyboard'?'keyboard':'keypad';
 const changed=()=>input.dispatchEvent(new Event('input',{bubbles:true}));
 input.value=value;
 let pad=null;
 container.innerHTML='';
 if(mode==='keypad'){
  container.className=choiceClass+' answer-pad-host';
  pad=AnswerPad.mountAnswerPad(container,{input,onSubmit:()=>form.requestSubmit()});
 }else if(mode==='choice'){
  container.className=choiceClass;
  input.readOnly=true;input.setAttribute('inputmode','none');
  container.innerHTML=(gate.choices||[]).map(c=>`<button type="button" data-key="${esc(c)}">${esc(c)}</button>`).join('');
  container.querySelectorAll("[data-key]").forEach(b=>b.onclick=()=>{input.value=b.dataset.key;changed();});
 }else{
  container.className='';
  input.readOnly=false;input.setAttribute('inputmode','text');input.setAttribute('autocomplete','off');
 }
 const entry={
  mode,
  setValue(text){if(pad)pad.setValue(text);else{input.value=String(text??'');changed();}},
  destroy(){pad?.destroy();pad=null;if(current===entry)current=null;}
 };
 current=entry;
 return entry;
}

/** The answer area currently on the page (after a repaint, the new one). */
export function currentAnswerEntry(){return current;}
