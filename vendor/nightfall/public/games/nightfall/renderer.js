import {WORLD,BUILDINGS,TASKS,PICKUPS,PROPS,DISTRACTIONS,doorRects,propBounds,walls,nextObjective,worldFor} from './world.js?v=0.9.4';
import {drawCar,drawFixtures} from './hardware.js?v=0.9.4';
const motionPreference=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
export const MEDIA={actors:'./assets/nightfall/city/actors.png',tiles:'./assets/nightfall/city/tiles.png',props:'./assets/nightfall/city/props.png',ambient:'./assets/nightfall/city/ambient.mp3',danger:'./assets/nightfall/city/danger.mp3',ending:'./assets/nightfall/city/ending.mp3',effects:'./assets/nightfall/city/effects.wav',sfx:Object.fromEntries(['step','shot','shotgun','glass','alarm','moan','enemy-death','breach'].map(k=>[k,'./assets/nightfall/city/v092/'+k+'.wav']))};
export async function loadArt(){const art={};await Promise.all(['actors','tiles','props'].map(key=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{art[key]=im;resolve();};im.onerror=()=>reject(new Error(`Missing or invalid image: ${MEDIA[key]}`));im.src=MEDIA[key];})));return art;}
function cell(c,im,n,cols,rows,x,y,w,h){if(!im)return;const sw=im.width/cols,sh=im.height/rows;c.drawImage(im,(n%cols)*sw,Math.floor(n/cols)*sh,sw,sh,x,y,w,h);}
export function render(c,s,art,{map=s.map,reducedMotion=motionPreference?.matches||false}={}){
 const {WORLD,BUILDINGS,TASKS,PICKUPS,PROPS,BARRIERS}=worldFor(s);
 const ox=Math.max(0,Math.min(WORLD.width-640,s.x-320)),oy=Math.max(0,Math.min(WORLD.height-360,s.y-190));
 c.imageSmoothingEnabled=false;c.fillStyle='#172027';c.fillRect(0,0,640,360);c.save();c.translate(-ox,-oy);
 for(let y=Math.floor(oy/32)*32;y<oy+392;y+=32)for(let x=Math.floor(ox/32)*32;x<ox+672;x+=32){
   const room=BUILDINGS.find(b=>x>=b.x&&y>=b.y&&x<b.x+b.w&&y<b.y+b.h);let tile=room?room.floor:0;
   if(!room&&(x%256<32||y%256<32))tile=1;if(!room&&x===1184)tile=8;
   cell(c,art.tiles,tile,4,4,x,y,32,32);
 }
 for(const b of BUILDINGS){c.fillStyle='#101a1c99';c.fillRect(b.x+8,b.y+8,b.w,b.h);}
 for(const p of PROPS){if(p.wire&&s.tasks.power)c.globalAlpha=.5;if(p.art<=3)drawCar(c,p,s,art.props,reducedMotion);else cell(c,art.props,p.art,4,4,p.x,p.y,p.w,p.h);c.globalAlpha=1;if(p.burning){const glow=c.createRadialGradient(p.x+p.w/2,p.y+p.h/2,4,p.x+p.w/2,p.y+p.h/2,100);glow.addColorStop(0,'rgba(255,126,36,.28)');glow.addColorStop(1,'rgba(255,126,36,0)');c.fillStyle=glow;c.fillRect(p.x-100,p.y-100,p.w+200,p.h+200);}}
 drawInteriors(c,s,art);
 for(const t of TASKS){if(t.id==='escape'||t.id==='installed'||t.id==='return')continue;if((t.id==='survivor'&&s.tasks.survivor)||(t.id==='recruit'&&s.tasks.recruit))continue;cell(c,art.props,t.prop,4,4,t.x-28,t.y-28,56,56);if(!s.tasks[t.id]){c.strokeStyle=t.optional?'#87d7b5':'#f7c975';c.strokeRect(t.x-26,t.y-26,52,52);}}
 cell(c,art.props,0,4,4,1120,1056,96,152);
 for(const p of PICKUPS)if(!s.picked.includes(p.id)){cell(c,art.props,p.kind==='ammo'||p.kind==='shotgun'?10:13,4,4,p.x-16,p.y-16,32,32);c.strokeStyle=p.kind==='ammo'?'#e3be6f':'#9ee4b6';c.strokeRect(p.x-13,p.y-13,26,26);}
 for(const wall of walls(s).filter(w=>!w.window&&w.x<ox+640&&w.y<oy+360&&w.x+w.w>ox&&w.y+w.h>oy)){for(let x=wall.x+Math.max(0,Math.floor((ox-wall.x)/16))*16;x<Math.min(wall.x+wall.w,ox+640);x+=16)for(let y=wall.y+Math.max(0,Math.floor((oy-wall.y)/16))*16;y<Math.min(wall.y+wall.h,oy+360);y+=16)cell(c,art.tiles,wall.gate?12:5,4,4,x,y,16,16);}
 function actor(a,row,frame,scale=1){c.save();c.translate(a.x,a.y);c.rotate((a.angle||0)-Math.PI/2);c.fillStyle='#0007';c.beginPath();c.ellipse(0,5,13*scale,9*scale,0,0,Math.PI*2);c.fill();cell(c,art.actors,row*8+frame,8,5,-23*scale,-29*scale,46*scale,58*scale);c.restore();}
 if(s.scenario==='rescue'){
  c.fillStyle='#c5d8dd';c.font='bold 13px system-ui';c.fillText('SOUTH ROAD',640,1232);c.fillText('ALLEY ↑',758,920);c.fillText('NORTH ROAD',944,632);
  c.strokeStyle='#83edbf';c.lineWidth=3;c.beginPath();c.arc(1168,1168,72,0,Math.PI*2);c.stroke();c.fillStyle='#d7ffe9';c.font='bold 14px system-ui';c.fillText('TERMINAL · RETURN HERE',1060,1250);
  if(s.follower){actor(s.follower,0,1+Math.floor(s.time*6)%2);c.fillStyle='#9dffd4';c.fillText(s.route==='depot'?'TOMAS':'IMANI',s.follower.x-24,s.follower.y-34);}
 }
 const actors=s.enemies.filter(e=>e.x>ox-50&&e.x<ox+690&&e.y>oy-50&&e.y<oy+410).sort((a,b)=>a.y-b.y);
 for(const e of actors){const row={shambler:1,runner:2,brute:3,crawler:4}[e.kind],frame=e.hp<=0?(s.time-(e.deathTime??-10)<.18?6:7):e.phase==='lunge'||e.phase==='windup'?5:e.phase==='stagger'?6:e.phase==='recover'?0:e.kind==='runner'&&e.phase==='chase'?3+Math.floor(s.time*10)%2:1+Math.floor(s.time*6)%2;actor(e,row,frame,e.kind==='brute'?1.15:1);if(e.phase==='windup'){c.strokeStyle='#f28c67';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,29,0,Math.PI*2);c.stroke();}}
 if(s.immune<=0||Math.floor(s.time*10)%2===0){const frame=['lost','setback'].includes(s.outcome)?7:s.anim==='hurt'?6:s.anim==='fire'?5:s.anim==='run'?3+Math.floor(s.time*11)%2:s.anim==='walk'?1+Math.floor(s.time*6)%2:0;actor(s,0,frame);}
 c.strokeStyle='#e7e5b488';c.lineWidth=1;c.beginPath();c.moveTo(s.x+Math.cos(s.angle)*22,s.y+Math.sin(s.angle)*22);c.lineTo(s.x+Math.cos(s.angle)*110,s.y+Math.sin(s.angle)*110);c.stroke();
 c.fillStyle='#ffeaba';for(const b of s.bullets)c.fillRect(b.x-2,b.y-2,4,4);
 for(const b of BUILDINGS){const inside=s.x>b.x&&s.y>b.y&&s.x<b.x+b.w&&s.y<b.y+b.h;if(!inside){c.fillStyle='rgba(27,36,40,.78)';c.fillRect(b.x+16,b.y+16,b.w-32,b.h-32);c.fillStyle='#d9d9c9';c.font='bold 13px system-ui';c.fillText(b.name,b.x+28,b.y+52);}c.fillStyle=b.id==='garage'&&!s.tasks.power?'#d37c66':'#91ccad';c.fillRect(b.door,b.y+b.h-8,80,4);}
 for(const d of doorRects(s)){const v=s.doors[d.id];c.fillStyle=v.hp<=0?'#69544b':v.closed?v.hp<40?'#c95748':v.hp<70?'#c99345':'#71a3ab':'#56866b';c.fillRect(d.x,d.y,d.w,v.closed?16:4);if(v.closed){c.strokeStyle='#eee';c.strokeRect(d.x,d.y,d.w*v.hp/100,3);}}
 drawFixtures(c,s);
 if(s.debug){c.strokeStyle='#fb76c9';for(const r of [...walls(s),...PROPS.map(propBounds)])c.strokeRect(r.x,r.y,r.w,r.h);for(const e of s.enemies.filter(e=>e.hp>0)){c.strokeStyle=e.phase==='chase'?'#f44':'#6cf';if(e.target){c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.target.x,e.target.y);c.stroke();}c.strokeRect(e.x-10,e.y-10,20,20);}if(s.noise>0){c.strokeStyle='#ff9';c.beginPath();c.arc(s.noiseX,s.noiseY,s.noiseRadius,0,Math.PI*2);c.stroke();}}
 c.restore();
 const shade=c.createRadialGradient(320,190,85,320,190,390);shade.addColorStop(0,'#07131c00');shade.addColorStop(1,'#07131c99');c.fillStyle=shade;c.fillRect(0,0,640,360);
 c.strokeStyle='#b8d2dc26';c.lineWidth=1;for(let i=0;i<34;i++){const x=(i*139+s.time*29)%640,y=(i*73+s.time*205)%360;c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y+9);c.stroke();}
 if(s.interact>0){const t=TASKS.find(t=>t.id===s.interactId),progress=Math.min(1,s.interact/(t?.duration||1.2));c.fillStyle='#081724';c.fillRect(180,328,280,24);c.fillStyle='#76dac4';c.fillRect(184,346,272*progress,3);c.font='bold 12px system-ui';c.fillStyle='#fff';c.fillText('HOLD SEARCH / USE · '+Math.floor(progress*100)+'%',196,341);}
 const objective=nextObjective(s);if(objective){const x=Math.max(20,Math.min(620,objective.x-ox)),y=Math.max(22,Math.min(338,objective.y-oy));c.strokeStyle='#ffda8a';c.lineWidth=2;c.beginPath();c.moveTo(x,y-8);c.lineTo(x+8,y);c.lineTo(x,y+8);c.lineTo(x-8,y);c.closePath();c.stroke();}

 if(map){c.fillStyle='#0b171eee';c.fillRect(65,25,510,255);const scale=.18;for(const b of BARRIERS){c.fillStyle='#34434c';c.fillRect(86+b.x*scale,40+b.y*scale,b.w*scale,b.h*scale);}for(const b of BUILDINGS){c.fillStyle='#798b89';c.fillRect(86+b.x*scale,40+b.y*scale,b.w*scale,b.h*scale);}for(const t of TASKS){c.fillStyle=s.tasks[t.id]?'#7fba99':t.optional?'#a9baf3':'#ffd183';c.fillRect(86+t.x*scale-3,40+t.y*scale-3,6,6);}c.fillStyle='#fff';c.beginPath();c.arc(86+s.x*scale,40+s.y*scale,4,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='12px system-ui';c.fillText(s.scenario==='rescue'?'YOU: white · RESCUE / RETURN: amber · WALLS: grey':'YOU: white   OBJECTIVES: amber   STORE: lavender',85,270);}
}

function drawInteriors(c,s,art){
 const {BUILDINGS}=worldFor(s);
 if(s.scenario==='rescue'){
  // Route-specific decoration stays clear of the two real window openings.
  if(s.route==='clinic'){cell(c,art.props,13,4,4,1856,176,64,64);c.fillStyle='#cfdddd';c.fillRect(1720,352,112,40);c.fillStyle='#bf424b';c.fillRect(1764,362,24,8);c.fillRect(1772,354,8,24);}
  else{cell(c,art.props,6,4,4,1872,352,64,64);c.fillStyle='#896643';c.fillRect(1696,352,128,32);c.strokeStyle='#b7c1c5';c.lineWidth=4;for(let i=0;i<4;i++){c.beginPath();c.moveTo(1708+i*26,356);c.lineTo(1718+i*26,376);c.stroke();}}
  return;
 }
 const layouts={maintenance:[[5,480,168],[15,272,352]],dispatch:[[5,864,112],[15,1176,304]],garage:[[6,1984,688],[15,2280,784]],substation:[[7,272,800],[7,576,928]],store:[[10,1480,176],[15,1696,416]]};
 for(const b of BUILDINGS){if(s.x<b.x||s.x>b.x+b.w||s.y<b.y||s.y>b.y+b.h)continue;
 for(const [tile,x,y]of layouts[b.id]||[])cell(c,art.props,tile,4,4,x,y,64,64);
 // Decorative only: every objective and window clearance remains traversable.
 if(b.id==='store'&&s.scenario!=='rescue'){c.fillStyle='#86654b';c.fillRect(1510,360,96,12);for(let i=0;i<4;i++){c.fillStyle=['#b56a3f','#526f82','#9c9864','#776087'][i];c.beginPath();c.arc(1520+i*24,350,9,0,Math.PI*2);c.fill();}c.strokeStyle='#afb6a3';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(1710+i*12,185);c.lineTo(1710+i*12,232);c.stroke();}}
 const on=b.id==='dispatch'||s.tasks.power;c.fillStyle=on&&(Math.floor(s.time*2)%3)?'#a7d77d':'#384944';c.fillRect(b.x+50,b.y+65,6,4);
 }
}
