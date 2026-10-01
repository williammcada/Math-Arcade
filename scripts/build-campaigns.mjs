import {cpSync,readFileSync,writeFileSync} from 'node:fs';
export function buildChrono(root){
 const dir=root+'/build/chrono';cpSync(root+'/vendor/chrono/public',dir,{recursive:true});
 let html=readFileSync(dir+'/index.html','utf8').replace(/src="\.\/game.js[^\"]*"/,'src="./campaign-runtime.js"');writeFileSync(dir+'/index.html',html);
 cpSync(root+'/public/campaign-runtime.js',dir+'/campaign-runtime.js');
 cpSync(root+'/adapters/chrono-ui.js',dir+'/arcade-ui.js');
 let code=readFileSync(dir+'/game.js','utf8');
 code=code.replaceAll('save.sharedGates.relay?.gate',"localStorage.getItem('arcade-chrono-relay')");
 code=code.replace('function loop(now){','function loop(now){if(window.arcadePaused){state.lastTime=now;state.raf=requestAnimationFrame(loop);return;}');
 code=code.replace("if('serviceWorker' in navigator&&location.protocol.startsWith('http'))",'if(false)');
 code=code.replace('function adultLogin(', 'function standaloneAdultLogin(');
 code+='\nfunction adultLogin(back){alert("Your teacher manages practice and reports from the teacher desk.");back();}\nwindow.arcadePause=()=>{clearInput();persist();};\nwindow.arcadeAssignment=c=>{save.sharedMath.config=structuredClone(c);save.settings.questionsPerGate=c.count;};\nwindow.arcadeAssignment(window.arcadeConfig);\n';
 writeFileSync(dir+'/game.js',code);
}
export async function buildOlivia(root){
 const {build}=await import('esbuild'),dir=root+'/build/olivia';cpSync(root+'/vendor/olivia/public',dir,{recursive:true});cpSync(root+'/vendor/olivia/src',root+'/build/olivia-src',{recursive:true});
 let code=readFileSync(root+'/build/olivia-src/main.ts','utf8');
 const a=code.indexOf('function startMath('),b=code.indexOf('function renderMath()',a);if(a<0||b<a)throw Error('Olivia gate boundary changed');code=code.slice(0,a)+readFileSync(root+'/adapters/olivia-math.ts','utf8')+'\n'+code.slice(b);
 code=code.replace('Loading offline adventure…','Classroom adventure · progress saves to your profile');
 code=code.replace('function parentChallenge(){', 'function standaloneParentChallenge(){');
 code=code.replace("if('serviceWorker' in navigator&&location.protocol!=='file:')",'if(false)');
 code+='\nfunction parentChallenge(){alert("Your teacher manages math practice from the teacher desk.");closeAdult();}\n(window as any).arcadePause=(paused:boolean)=>{clearControls();resetKeyboard();releaseTouch?.();if(paused){game.loop.sleep();audio.context?.suspend();}else{game.loop.wake();if(mode===\'PlatformScene\')installTouch();}save.persist();};\n(window as any).arcadeAssignment=(c:any)=>{if(save.data.mathPractice)save.data.mathPractice.config=structuredClone(c);};\n(window as any).arcadeAssignment((window as any).arcadeConfig);\n';
 writeFileSync(root+'/build/olivia-src/main.ts',code);
 await build({entryPoints:[root+'/build/olivia-src/main.ts'],bundle:true,format:'esm',outfile:dir+'/game.js',minify:true,target:'es2022',define:{'import.meta.env.PROD':'true','import.meta.env.DEV':'false'},legalComments:'linked'});
 writeFileSync(dir+'/index.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Olivia’s Magic Bracelet Quest</title><link rel="stylesheet" href="./game.css"></head><body><main id="app"><div id="game" aria-label="Olivia’s platform adventure"></div><section id="ui" aria-live="polite"></section><div id="touch"></div></main><script type="module" src="./campaign-runtime.js"></script></body></html>');
 cpSync(root+'/public/campaign-runtime.js',dir+'/campaign-runtime.js');
}
