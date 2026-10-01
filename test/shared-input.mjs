// Upstream MathQuest 59c11c90 held-input regression; adapted only module resolution.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {Window}=createRequire(import.meta.url)('happy-dom');
import {bindGameInput,CONTROL_PROFILES,controlMarkup} from '../build/coastal/engine/controls.js';
import {bindDirectionalInput} from '../build/coastal/engine/directional-input.js';
function fixture(kind='aerial'){
 const win=new Window(),doc=win.document,root=doc.createElement('div');doc.body.append(root);
 root.innerHTML=kind==='aerial'?'<section class="flight-shell"><div class="flight-hud">HULL</div><div data-dpad><button data-direction="right">R</button><button data-direction="left">L</button></div><input><textarea></textarea></section>':'<section class="nf-game"><div class="nf-hud">HULL</div>'+controlMarkup(CONTROL_PROFILES.nightfall)+'<input></section>';
 let value={},blocked=false,pauses=0;const ac=new win.AbortController();
 const options={signal:ac.signal,onChange:v=>value=v,blocked:()=>blocked,onPause:()=>pauses++};
 const binding=kind==='aerial'?bindDirectionalInput(root,options):bindGameInput(root,CONTROL_PROFILES.nightfall,options);
 const zones=[...root.querySelectorAll('[data-held-input]')];
 zones.forEach((el,i)=>{el.getBoundingClientRect=()=>({left:i*200,top:0,right:i*200+168,bottom:168,width:168,height:168});el.setPointerCapture=()=>{throw Error('capture unavailable');};});
 const point=(id,index=0,x=140,y=84)=>({identifier:id,clientX:index*200+x,clientY:y,target:zones[index]});
 const pointer=(type,id=1,index=0,x=140,y=84,extra={})=>{const e=new win.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:id,pointerType:'touch',buttons:1,button:0,clientX:index*200+x,clientY:y,...extra});(type==='pointerdown'?zones[index]:doc).dispatchEvent(e);return e;};
 const touch=(type,changed,touches)=>{const e=new win.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{changedTouches:changed,touches});(changed[0]?.target||doc).dispatchEvent(e);return e;};
 const key=(type,key,extra={})=>{const e=new win.KeyboardEvent(type,{key,bubbles:true,cancelable:true,...extra});doc.body.dispatchEvent(e);};
 return {win,doc,root,zones,binding,ac,pointer,touch,point,key,get value(){return value;},get pauses(){return pauses;},set blocked(v){blocked=v;}};
}
for(const kind of ['aerial','buttons']){
 test(`${kind}: failed capture, global release/cancel/lost capture, fresh input`,()=>{const f=fixture(kind);for(const type of ['pointerup','pointercancel','lostpointercapture']){f.pointer('pointerdown');assert.ok(Object.keys(f.value).length);f.pointer(type);assert.deepEqual(f.value,{});}f.pointer('pointerdown');f.pointer('pointermove',1,0,190);assert.deepEqual(f.value,{});f.pointer('pointermove');assert.ok(Object.keys(f.value).length);f.pointer('pointermove',1,0,140,84,{buttons:0});assert.deepEqual(f.value,{});f.ac.abort();});
 test(`${kind}: touch list releases without pointerup, both multi-touch release orders`,()=>{for(const first of [1,2]){const f=fixture(kind),a=f.point(1),b=f.point(2,kind==='aerial'?0:1,20);f.pointer('pointerdown');f.touch('touchstart',[a],[a]);f.touch('touchstart',[b],[a,b]);assert.ok(Object.keys(f.value).length>=2);const ended=first===1?a:b,remaining=first===1?b:a;f.touch('touchend',[ended],[remaining]);assert.equal(Object.keys(f.value).length,1);f.touch('touchend',[remaining],[]);assert.deepEqual(f.value,{});f.touch('touchstart',[a],[a]);assert.ok(Object.keys(f.value).length);f.touch('touchcancel',[a],[]);assert.deepEqual(f.value,{});f.ac.abort();}});
 test(`${kind}: blocked input, interruptions and teardown cannot relatch held contacts`,()=>{const f=fixture(kind),a=f.point(1);for(const type of ['blur','pagehide','orientationchange','resize']){f.touch('touchstart',[a],[a]);f.win.dispatchEvent(new f.win.Event(type));assert.deepEqual(f.value,{});f.touch('touchmove',[a],[a]);assert.deepEqual(f.value,{});}f.touch('touchstart',[a],[a]);f.blocked=true;f.binding.poll();assert.deepEqual(f.value,{});f.blocked=false;f.touch('touchmove',[a],[a]);assert.deepEqual(f.value,{});f.touch('touchstart',[a],[a]);f.ac.abort();assert.deepEqual(f.value,{});f.touch('touchstart',[a],[a]);assert.deepEqual(f.value,{});});
 test(`${kind}: stationary holds persist; keyboard aliases and touch stay independent`,()=>{const f=fixture(kind),a=f.point(1);f.touch('touchstart',[a],[a]);for(let i=0;i<2000;i++)f.binding.poll();assert.ok(Object.keys(f.value).length);f.key('keydown','ArrowRight');f.key('keydown','d');f.touch('touchend',[a],[]);f.key('keyup','d');assert.equal(f.value.right,true);f.key('keyup','ArrowRight');assert.deepEqual(f.value,{});f.binding.clear();f.key('keydown','d',{repeat:true});assert.deepEqual(f.value,{});f.key('keydown','d');assert.equal(f.value.right,true);f.ac.abort();});
 test(`${kind}: long-press menu and selection are blocked inside play, editable fields remain usable`,()=>{const f=fixture(kind);for(const type of ['contextmenu','selectstart','dragstart']){f.pointer('pointerdown');const e=new f.win.Event(type,{bubbles:true,cancelable:true});f.root.querySelector('[class$="hud"]').dispatchEvent(e);assert.equal(e.defaultPrevented,true);assert.deepEqual(f.value,{});const edit=new f.win.Event(type,{bubbles:true,cancelable:true});f.root.querySelector('input').dispatchEvent(edit);assert.equal(edit.defaultPrevented,false);}f.ac.abort();});
}
