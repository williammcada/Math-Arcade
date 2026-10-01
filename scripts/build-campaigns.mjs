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
