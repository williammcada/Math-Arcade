function startMath(context:Attempt['context']){
 if(context==='parent-check'){parentChallenge();return;}
 const r=save.data.active;if(!r)return;
 releaseTouch?.();resetKeyboard();clearControls();mathContext=context;
 if(context==='gate'){r.phase='gate';save.persist();}
 if(context==='gate'||context==='refill'){game.scene.pause('PlatformScene');touch.innerHTML='';}
 mode='ClassroomMath';audio.stopVoice();
 const metaKey='arcade-olivia-gate',old=JSON.parse(localStorage.getItem(metaKey)||'null');
 const key=old?.run===r.id&&old?.context===context?old.key:r.id+':'+context+(context==='refill'?':'+crypto.randomUUID():'');
 localStorage.setItem(metaKey,JSON.stringify({run:r.id,context,key}));save.persist();
 (window as any).arcadeGate(key,{onCorrect:()=>{r.energy=Math.min(6,r.energy+(context==='refill'?2:1));if(context==='practice')r.practiceDone=Math.min(5,r.practiceDone+1);if(context==='gate')r.gateDone=Math.min(2,r.gateDone+1);save.persist();audio.good();}}).then(()=>{localStorage.removeItem(metaKey);completeMath();save.persist();void (window as any).arcadeFlush();}).catch(()=>{});
}
