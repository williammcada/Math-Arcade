/** Raster poses from the approved Lumi mockup, registered at the saddle. */
export const flightTextures=Array.from({length:6},(_,i)=>({key:'fly'+i,file:`lumi-flight-${i}.png`}));
export const flightSprite={size:96,originX:.6,originY:.71,wristX:5,wristY:-15};
// Ease through the apex and return through intermediate poses.
const cycle=[{pose:0,ms:110},{pose:1,ms:75},{pose:2,ms:70},{pose:3,ms:65},{pose:4,ms:100},{pose:3,ms:70},{pose:2,ms:75},{pose:5,ms:75},{pose:1,ms:75}];
export const flightCycleMs=cycle.reduce((sum,f)=>sum+f.ms,0);
export function flightTextureAt(elapsed:number,reducedMotion=false){
 if(reducedMotion)return 'fly2';
 let time=((elapsed%flightCycleMs)+flightCycleMs)%flightCycleMs;
 for(const frame of cycle){if(time<frame.ms)return 'fly'+frame.pose;time-=frame.ms;}
 return 'fly0';
}
