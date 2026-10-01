import {DISTRACTIONS,propBounds,WINDOWS,worldFor} from './world.js?v=0.9.4';
// Authored vehicles from the same prop atlas as the bus; collision stays unchanged.
export function alarmLight(p,s,reducedMotion=false){
 const {DISTRACTIONS}=worldFor(s);
 const alarm=DISTRACTIONS.find(d=>d.kind==='alarm'&&d.propId===p.id);
 if(!alarm)return null;
 const live=s.distractions[alarm.id],state=!live?'ready':live.until>s.time?'active':'spent';
 const bright=state!=='spent'&&(reducedMotion||(state==='active'?(s.time-live.started)%0.8<0.4:s.time%2<0.75));
 return {state,bright};
}
export function drawCar(c,p,s,art,reducedMotion=false){
 const b=propBounds(p),light=alarmLight(p,s,reducedMotion);
 c.save();c.translate(b.x+b.w/2,b.y+b.h/2);c.rotate(Math.PI/2);
 const sw=art.width/4,sh=art.height/4;c.drawImage(art,p.art*sw,0,sw,sh,-b.h*.64,-b.w*.58,b.h*1.28,b.w*1.16);c.restore();
 // Roof beacon sits inside the rotated vehicle silhouette, away from bumper edges.
 if(light){const x=b.x+b.w*.52,y=b.y+b.h*.5,active=light.state==='active';
   c.save();
   if(light.bright){c.fillStyle=active?'#ff343455':'#ff34342b';c.beginPath();c.ellipse(x,y,active?12:8,active?9:6,0,0,Math.PI*2);c.fill();}
   c.fillStyle='#101722';c.fillRect(x-5,y-4,10,8);
   c.fillStyle=light.bright?(active?'#ffb0a0':'#ff4f54'):light.state==='spent'?'#422329':'#8c2838';c.fillRect(x-3,y-2,6,4);
   if(light.bright){c.fillStyle='#ffe4d6';c.fillRect(x-2,y-1,2,1);}c.restore();
 }
}
export function drawFixtures(c,s){
 const {DISTRACTIONS,WINDOWS}=worldFor(s);
 for(const d of DISTRACTIONS){if(d.kind!=='barrel')continue;
   const live=s.distractions[d.id],warning=live&&s.time<live.ignitesAt,fire=live&&s.time>=live.ignitesAt&&s.time<live.until;
   c.save();c.translate(d.x,d.y);const metal=c.createLinearGradient(-12,0,12,0);metal.addColorStop(0,'#322b28');metal.addColorStop(.5,'#9a7651');metal.addColorStop(1,'#42352d');c.fillStyle=metal;c.beginPath();c.roundRect(-12,-15,24,30,4);c.fill();c.strokeStyle='#c4b298';c.lineWidth=2;c.beginPath();c.moveTo(-12,-8);c.lineTo(12,-8);c.moveTo(-12,8);c.lineTo(12,8);c.stroke();c.fillStyle='#efe3ca';c.fillRect(-10,-5,20,11);c.font='bold 8px system-ui';c.fillStyle='#362520';c.fillText('GAS',-9,3);
   if(warning||fire){c.strokeStyle=warning?'#ffd6a1':'#ff8752';c.lineWidth=2;c.setLineDash(warning?[6,4]:[]);c.beginPath();c.arc(0,0,60,0,Math.PI*2);c.stroke();c.setLineDash([]);}
   if(warning){c.font='bold 10px system-ui';c.fillStyle='#fff0d3';c.fillText('IGNITING — MOVE!',-45,-65);}
   if(fire){const glow=c.createRadialGradient(0,0,5,0,0,60);glow.addColorStop(0,'#ffe4a8aa');glow.addColorStop(1,'#f2663230');c.fillStyle=glow;c.beginPath();c.arc(0,0,60,0,Math.PI*2);c.fill();for(let i=0;i<9;i++){const a=i*2.4,r=i?20+i*3:0,x=Math.cos(a)*r,y=Math.sin(a)*r;c.fillStyle=i%2?'#ffb644bb':'#ff663caa';c.beginPath();c.moveTo(x-7,y+8);c.quadraticCurveTo(x-12,y-4,x+Math.sin(s.time*9+i)*5,y-23);c.quadraticCurveTo(x+13,y-4,x+7,y+8);c.closePath();c.fill();}}
   c.restore();
 }
 for(const w of WINDOWS){const broken=s.windows?.[w.id];c.fillStyle=broken?'#12222c':'#729fab';c.fillRect(w.x,w.y,w.w,w.h);c.strokeStyle='#c8e4e6';c.lineWidth=2;c.strokeRect(w.x,w.y,w.w,w.h);
   if(!broken){c.strokeStyle='#253c4d';for(let y=w.y+20;y<w.y+w.h;y+=20){c.beginPath();c.moveTo(w.x,y);c.lineTo(w.x+w.w,y);c.stroke();}c.strokeStyle='#d9eff4';c.beginPath();c.moveTo(w.x+3,w.y+7);c.lineTo(w.x+12,w.y+17);c.stroke();}
   else{c.fillStyle='#c4e4e5';c.beginPath();c.moveTo(w.x,w.y);c.lineTo(w.x+7,w.y+8);c.lineTo(w.x+16,w.y);c.fill();}
   c.font='bold 9px system-ui';c.fillStyle='#e5f2f4';c.fillText(broken?'EXIT':'GLASS',w.x-10,w.y-5);
 }
}
