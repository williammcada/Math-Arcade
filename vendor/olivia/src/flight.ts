export const FLIGHT={startX:76,startY:145,minY:57,maxY:177,cruise:232,boost:310,climb:158,acceleration:660,boostDuration:1300,boostCooldown:5200,finish:14880,width:15200};
export interface SkyObstacle {x:number;y:number;w:number;h:number;kind:'storm'|'balloon'|'kite';drift:number;period:number}
export const skyObstacles:readonly SkyObstacle[]=Array.from({length:14},(_,i)=>({
 x:850+i*1020,y:i%2?163:66,w:i%3===2?44:66,h:i%3===2?38:48,
 kind:(['storm','balloon','kite'] as const)[i%3],drift:i>3?7:0,period:2100+i%3*300
}));
export const flightPickups:[number,number,number][] = skyObstacles.flatMap((o,i)=>{
 const y=i%2?77:146;
 return [[o.x-200,y,12+(i*2)%24],[o.x+170,y+(i%2?8:-8),12+(i*2+1)%24]];
});
export interface FlightState {x:number;y:number;vy:number;speed:number;elapsed:number;boostUntil:number;boostReadyAt:number;bumpUntil:number;invulnerableUntil:number;boostWas:boolean;bumps:number}
export const flightState=(position?:{x:number;y:number}):FlightState=>({x:Math.max(FLIGHT.startX,Math.min(FLIGHT.finish,position?.x??FLIGHT.startX)),y:Math.max(FLIGHT.minY,Math.min(FLIGHT.maxY,position?.y??FLIGHT.startY)),vy:0,speed:0,elapsed:0,boostUntil:0,boostReadyAt:0,bumpUntil:0,invulnerableUntil:0,boostWas:false,bumps:0});
export function obstacleY(o:SkyObstacle,time:number){return o.y+Math.sin(time/o.period*Math.PI*2)*o.drift;}
export function advanceFlight(s:FlightState,input:{up:boolean;down:boolean;boost:boolean},delta:number){
 const dt=Math.max(0,Math.min(delta,50))/1000;s.elapsed+=dt*1000;
 if(input.boost&&!s.boostWas&&s.elapsed>=s.boostReadyAt){s.boostUntil=s.elapsed+FLIGHT.boostDuration;s.boostReadyAt=s.elapsed+FLIGHT.boostCooldown;}
 s.boostWas=input.boost;
 const desired=(Number(input.down)-Number(input.up))*FLIGHT.climb;
 s.vy+=Math.max(-FLIGHT.acceleration*dt,Math.min(FLIGHT.acceleration*dt,desired-s.vy));
 s.y=Math.max(FLIGHT.minY,Math.min(FLIGHT.maxY,s.y+s.vy*dt));
 if(s.y===FLIGHT.minY||s.y===FLIGHT.maxY)s.vy=0;
 const cruise=170+Math.min(1,Math.max(0,s.x-100)/900)*(FLIGHT.cruise-170);
 const target=s.elapsed<s.bumpUntil?105:s.x>FLIGHT.finish-400?140:s.elapsed<s.boostUntil?FLIGHT.boost:cruise;
 s.speed+=Math.max(-350*dt,Math.min(220*dt,target-s.speed));
 s.x=Math.min(FLIGHT.finish,s.x+s.speed*dt);return s;
}
export function touchesObstacle(s:Pick<FlightState,'x'|'y'|'elapsed'>,o:SkyObstacle){return Math.abs(s.x-o.x)<o.w/2+22&&Math.abs(s.y-obstacleY(o,s.elapsed))<o.h/2+13;}
export function bumpFlight(s:FlightState){if(s.elapsed<s.invulnerableUntil)return false;s.bumps++;s.bumpUntil=s.elapsed+850;s.invulnerableUntil=s.elapsed+1500;return true;}
/** Swept collection also works during a speed burst on a slower phone. */
export function passesBead(from:{x:number;y:number},to:{x:number;y:number},bead:{x:number;y:number}){
 const dx=to.x-from.x,dy=to.y-from.y,length=dx*dx+dy*dy;
 const t=length?Math.max(0,Math.min(1,((bead.x-from.x)*dx+(bead.y-from.y)*dy)/length)):0;
 return Math.hypot(bead.x-from.x-t*dx,bead.y-from.y-t*dy)<27;
}
