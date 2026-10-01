/** Track each pointer independently. Clear on interruption; never time out a held finger. */
export function bindHeldControls(root:HTMLElement,set:(key:string,held:boolean)=>void){
 const contacts=new Map<number,string>(),keys=new Set<string>();
 const sync=()=>{for(const k of keys)set(k,[...contacts.values()].includes(k));};
 const end=(e:PointerEvent)=>{contacts.delete(e.pointerId);sync();};
 const clear=()=>{contacts.clear();sync();};
 const down=(e:PointerEvent)=>{const b=(e.target as Element).closest<HTMLElement>('[data-control]');if(!b||!root.contains(b))return;e.preventDefault();const k=b.dataset.control!;keys.add(k);contacts.set(e.pointerId,k);try{b.setPointerCapture(e.pointerId);}catch{contacts.delete(e.pointerId);}sync();};
 const move=(e:PointerEvent)=>{if(!contacts.has(e.pointerId))return;if(e.buttons===0){end(e);return;}const b=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-control]');if(!b||!root.contains(b)){end(e);return;}const k=b.dataset.control!;keys.add(k);contacts.set(e.pointerId,k);sync();};
 window.addEventListener('olivia-input-reset',clear);root.addEventListener('pointerdown',down);root.addEventListener('lostpointercapture',end);window.addEventListener('pointermove',move);window.addEventListener('pointerup',end,true);window.addEventListener('pointercancel',end,true);window.addEventListener('blur',clear);window.addEventListener('resize',clear);window.addEventListener('orientationchange',clear);document.addEventListener('visibilitychange',clear);
 return ()=>{clear();window.removeEventListener('olivia-input-reset',clear);root.removeEventListener('pointerdown',down);root.removeEventListener('lostpointercapture',end);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end,true);window.removeEventListener('pointercancel',end,true);window.removeEventListener('blur',clear);window.removeEventListener('resize',clear);window.removeEventListener('orientationchange',clear);document.removeEventListener('visibilitychange',clear);};
}
