import {HAVEN_SWITCHES,trolleyRect} from './false-haven-world.js?v=0.9.7';
export function drawHaven(c,s){
 const h=s.haven;
 c.save();
 // Environmental machinery uses deliberate pixel geometry alongside the existing atlas.
 c.fillStyle='#22494e';c.fillRect(2480,1088,176,192);
 if(!s.tasks.passage_drained){const level=h.drainStarted===null?1:Math.max(0,1-(s.time-h.drainStarted)/6);c.fillStyle='#52b4c688';c.fillRect(2480,1088+192*(1-level),176,192*level);for(let i=0;i<5;i++){c.fillStyle='#a4d3db99';c.fillRect(2490+(i%2)*12,1104+i*32,128,2);}}
 c.strokeStyle='#a7c8ba';c.strokeRect(2480,1088,176,192);c.font='bold 12px system-ui';c.fillStyle='#dbefdd';c.fillText(s.tasks.passage_drained?'DRAINED':'FLOODED PASSAGE',2448,1072);
 c.strokeStyle='#bd9f59';c.setLineDash([8,8]);c.strokeRect(3192,800,356,72);c.setLineDash([]);
 const t=trolleyRect(s);c.fillStyle='#675447';c.fillRect(t.x,t.y,t.w,t.h);c.strokeStyle='#d7b871';c.strokeRect(t.x,t.y,t.w,t.h);for(let i=0;i<3;i++)c.strokeRect(t.x+5+i*27,t.y+4,22,24);
 for(const q of HAVEN_SWITCHES){c.fillStyle=q.id==='speaker'&&h.speakerUntil>s.time?'#f3c769':'#9ab4ad';c.fillRect(q.x-14,q.y-14,28,28);c.fillStyle='#102c31';c.fillRect(q.x-7,q.y-7,14,14);c.fillStyle='#e8e6cf';c.font='bold 11px system-ui';c.fillText(q.id==='speaker'?'BROADCAST':q.id==='trap'?'GATE':'BARRICADE',q.x-35,q.y-24);}
 c.strokeStyle='#93b9b2';c.lineWidth=3;c.beginPath();c.moveTo(1696,544);c.lineTo(1856,544);c.lineTo(1856,1152);c.lineTo(2432,1152);c.stroke();
 c.fillStyle='#091b21';c.fillRect(1736,480,248,27);c.fillStyle='#f7d487';c.font='bold 13px system-ui';c.fillText('POWER: '+h.powerCircuit.toUpperCase(),1744,499);
 const labels=[['ARRIVAL / BUS',512,1512],['SHELTER BLOCK',304,160],['UTILITY YARD',1616,256],['INSPECTION LANE',1984,680],['LOADING DEPOT',3072,224],['VEHICLE EXIT',2656,1840]];
 c.font='bold 16px system-ui';c.fillStyle='#c7d2c1';for(const [label,x,y]of labels)c.fillText(label,x,y);
 c.strokeStyle='#badfb0';c.lineWidth=3;c.beginPath();c.arc(640,1696,64,0,Math.PI*2);c.stroke();
 if(h.finaleAt!==null){c.fillStyle='#fa8765';c.fillRect(2688,1516,8,8);c.font='bold 13px system-ui';c.fillText('EVACUATE → BUS',2704,1530);}
 c.restore();
}
