// Shared contact ownership and interruption handling for every held-control profile.
// Touch Events reconcile the complete native contact list; Pointer Events cover
// mouse/pen and browsers that do not emit Touch Events. Never time out a real hold.
const editable='input,textarea,select,[contenteditable="true"],[data-allow-selection]';
const keyboardUI=editable+',dialog';
export function bindHeldInput(root,{zones,keys:bindings,signal,onChange,blocked=()=>false,onPause=()=>{},onMap=()=>{}}){
 const doc=root.ownerDocument,win=doc.defaultView,contacts=new Map(),keyboard=new Map();
 let nativeTouch=false,last='',disposed=false;
 const on=(el,type,fn,options={})=>el.addEventListener(type,fn,{signal,...options});
 const surface=root.querySelector('.flight-shell,.nf-game,.stealth-shell')||root;
 surface.classList.add('mq-input-surface');
 if(!doc.getElementById('mq-input-safety')){
  const style=doc.createElement('style');style.id='mq-input-safety';style.textContent=`.mq-input-surface,.mq-input-surface *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}.mq-input-surface{touch-action:manipulation}.mq-input-surface [data-held-input],.mq-input-surface [data-held-input] *,.mq-input-surface canvas,.mq-input-surface .flight-hud,.mq-input-surface .nf-hud,.mq-input-surface .stealth-hud{touch-action:none}.mq-input-surface input,.mq-input-surface textarea,.mq-input-surface select,.mq-input-surface [contenteditable="true"],.mq-input-surface [contenteditable="true"] *,.mq-input-surface [data-allow-selection],.mq-input-surface [data-allow-selection] *{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default;touch-action:auto}`;doc.head.append(style);
 }
 const sync=()=>{
  const value={};for(const k of keyboard.values())value[k]=true;
  for(const c of contacts.values())Object.assign(value,c.value);
  const identity=JSON.stringify(Object.keys(value).filter(k=>value[k]).sort());if(identity===last)return;last=identity;onChange(value);
 };
 const release=id=>{const c=contacts.get(id);if(!c)return;contacts.delete(id);try{if(c.pointerId!==undefined&&c.zone.element.hasPointerCapture?.(c.pointerId))c.zone.element.releasePointerCapture(c.pointerId);}catch{}sync();};
 const clear=()=>{keyboard.clear();for(const id of [...contacts.keys()])release(id);last='';sync();};
 const suspend=()=>{clear();onPause();};
 const cancel=e=>{if(e.cancelable)e.preventDefault();};
 const node=target=>target?.nodeType===3?target.parentElement:target;
 const isEditable=target=>!!node(target)?.closest?.(editable);
 const zoneAt=target=>zones.find(z=>z.element===node(target)||z.element.contains(node(target)));
 const poll=()=>{if(disposed)return;if(blocked()||doc.hidden){clear();return;}for(const [id,c]of contacts)if(!c.zone.element.isConnected)release(id);};
 for(const zone of zones){
  zone.element.setAttribute('data-held-input','');
  on(zone.element,'pointerdown',e=>{
   if(nativeTouch&&e.pointerType==='touch')return;
   cancel(e);poll();if(blocked()||doc.hidden||e.pointerType==='mouse'&&e.button!==0)return;
   const id='p:'+e.pointerId;contacts.set(id,{zone,pointerId:e.pointerId,type:e.pointerType,value:zone.read(e)});
   try{zone.element.setPointerCapture(e.pointerId);}catch{}sync();
  });
 }
 on(win,'pointermove',e=>{const id='p:'+e.pointerId,c=contacts.get(id);if(!c)return;poll();if(!contacts.has(id))return;if(e.buttons===0){release(id);return;}cancel(e);c.value=c.zone.read(e);sync();},{capture:true,passive:false});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])on(win,type,e=>release('p:'+e.pointerId),{capture:true});
 // A native touch list is authoritative even if an individual pointerup was lost.
 const useNativeTouch=()=>{nativeTouch=true;for(const [id,c]of contacts)if(c.type==='touch')release(id);};
 const reconcile=touches=>{const live=new Set(Array.from(touches||[],t=>'t:'+t.identifier));for(const id of contacts.keys())if(id.startsWith('t:')&&!live.has(id))release(id);};
 on(win,'touchstart',e=>{
  useNativeTouch();
  reconcile(e.touches);poll();if(blocked()||doc.hidden)return;
  let owned=false;for(const t of Array.from(e.changedTouches||[])){const zone=zoneAt(t.target||e.target);if(!zone)continue;contacts.set('t:'+t.identifier,{zone,value:zone.read(t),type:'native-touch'});owned=true;}
  if(owned)cancel(e);sync();
 },{capture:true,passive:false});
 on(win,'touchmove',e=>{useNativeTouch();reconcile(e.touches);poll();let owned=false;for(const t of Array.from(e.touches||[])){const c=contacts.get('t:'+t.identifier);if(c){c.value=c.zone.read(t);owned=true;}}if(owned)cancel(e);sync();},{capture:true,passive:false});
 for(const type of ['touchend','touchcancel'])on(win,type,e=>{useNativeTouch();for(const t of Array.from(e.changedTouches||[]))release('t:'+t.identifier);reconcile(e.touches);},{capture:true});
 const physicalKey=e=>e.code||e.key.toLowerCase();
 on(win,'keydown',e=>{
  if(node(e.target)?.closest?.(keyboardUI))return;
  const key=e.key.toLowerCase();if(key==='escape'){suspend();return;}
  poll();if(blocked()||doc.hidden)return;
  if(key==='m'&&!e.repeat){onMap();return;}
  const action=bindings[key],id=physicalKey(e);if(!action||e.repeat&&!keyboard.has(id))return;
  cancel(e);keyboard.set(id,action);sync();
 });
 on(win,'keyup',e=>{keyboard.delete(physicalKey(e));sync();},{capture:true});
 for(const type of ['blur','pagehide','orientationchange'])on(win,type,suspend);
 // A viewport resize invalidates contact geometry; new input must be deliberate.
 on(win,'resize',clear);if(win.visualViewport)on(win.visualViewport,'resize',clear);
 on(doc,'visibilitychange',()=>{if(doc.hidden)suspend();});
 on(surface,'contextmenu',e=>{if(!isEditable(e.target)){cancel(e);suspend();}},{capture:true});
 on(surface,'selectstart',e=>{if(!isEditable(e.target)){cancel(e);clear();}},{capture:true});
 on(surface,'dragstart',e=>{if(!isEditable(e.target)){cancel(e);clear();}},{capture:true});
 // Keep native scrolling/clicks in menus and forms; block long-press on the HUD/world.
 on(surface,'touchstart',e=>{if(!isEditable(e.target)&&node(e.target)?.closest?.('canvas,.flight-hud,.flight-rail,.flight-objective,.nf-hud,.stealth-hud,.stealth-instructions,.mq-objective'))cancel(e);},{passive:false});
 on(doc,'selectionchange',()=>{const selection=doc.getSelection();if(selection&&!selection.isCollapsed&&surface.contains(selection.anchorNode)&&!isEditable(selection.anchorNode)){selection.removeAllRanges();suspend();}});
 signal?.addEventListener('abort',()=>{clear();disposed=true;surface.classList.remove('mq-input-surface');for(const z of zones)z.element.removeAttribute('data-held-input');},{once:true});
 sync();return {clear,poll};
}
export function pointInside(point,element){const r=element.getBoundingClientRect();return point.clientX>=r.left&&point.clientX<=r.right&&point.clientY>=r.top&&point.clientY<=r.bottom;}
