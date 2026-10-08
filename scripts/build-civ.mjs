import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export function buildCiv(root){
 const manifest=JSON.parse(readFileSync(root+'/vendor/manifest.json'));
 const entry=manifest.files.find(f=>f.dest==='vendor/math-civ/PLAY-SEKIGAHARA-0.3.1.html');
 if(!entry)throw Error('Math Civ source is not pinned');
 const bytes=readFileSync(root+'/'+entry.dest);
 if(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')!==entry.sha)throw Error('Math Civ source hash mismatch');
 let html=bytes.toString('utf8');
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
 if(scripts.length!==2||!scripts[1][1].startsWith('globalThis.SEKIGAHARA_ASSETS='))throw Error('Math Civ script envelope changed');
 let code=scripts[1][1];
 const replace=(from,to)=>{if(code.split(from).length!==2)throw Error('Math Civ adapter boundary changed: '+from.slice(0,90));code=code.replace(from,to);};
 replace('new br(xr).start()', '(window.arcadeCiv=new br(xr),installArcadeCiv(window.arcadeCiv),window.arcadeCiv.start())');
 replace('Wn();var xr=',readFileSync(root+'/adapters/math-civ.js','utf8')+'\nWn();var xr=');
 replace('Compatibility saves use local storage in this viewer. Export backups; files moved to another app may use different storage. Existing IndexedDB saves remain untouched.', 'Classroom edition: saves are linked to your student profile. Use Save & back to arcade before leaving.');
 replace('LOCAL EDITION','BUILT-IN MATH · CLASSROOM EDITION');
 replace('LOCAL CAMPAIGNS','YOUR CLASSROOM CAMPAIGNS');
 // Resume schedules a fresh enemy decision; an interrupted timer cannot mutate state.
 replace('this.aiTimer=setTimeout(()=>this.dispatch({type:`AI_TURN`})','this.aiTimer=setTimeout(()=>{if(!window.arcadePaused)this.dispatch({type:`AI_TURN`})}') ;
 // Deleting a slot also removes its migration backups, not another slot's records.
 replace('delete t.saves[e],En(t)','delete t.saves[e];for(const k of Object.keys(t.backups))if(k.startsWith(e+`:`))delete t.backups[k];En(t)');
 // Keep story and operating instructions in separate labeled panels.
 replace('<h2>Japan is moving toward war</h2>','<section class="arcade-story"><h2>Story · Japan is moving toward war</h2>');
 replace('<p><strong>You will command the battle yourself.</strong>','</section><section class="arcade-directions"><h3>Your task</h3><p><strong>You will command the battle yourself.</strong>');
 replace('${Q(`Enter the Council`,`advance`,!1,`primary`)}<details>','${Q(`Enter the Council`,`advance`,!1,`primary`)}</section><details>');
 replace('<p>${X(n.drama)}</p><p>${X(n.goal)}</p>','<section class="arcade-story"><h3>Story</h3><p>${X(n.drama)}</p></section><section class="arcade-directions"><h3>Your task</h3><p>${X(n.goal)}</p>');
 replace('${Q(`Choose Policy`,`advance`,!1,`primary`)}</div></div>','${Q(`Choose Policy`,`advance`,!1,`primary`)}</section></div></div>');
 replace('<p>${X(r.why)}</p><h3>What you can achieve</h3>','<section class="arcade-story"><h3>Story</h3><p>${X(r.why)}</p></section><section class="arcade-directions"><h3>Your task · What you can achieve</h3>');
 replace('${Q(`Plan this order`,`open:`+e,!Yt(t,e),`primary`)}${Q(`Back`,`close`)}</div>','${Q(`Plan this order`,`open:`+e,!Yt(t,e),`primary`)}${Q(`Back`,`close`)}</div></section>');
 replace('<p>“Not quite, my lord. Let us check the figures.”</p>','<section class="arcade-story"><h3>Adviser</h3><p>“Not quite, my lord. Let us check the figures.”</p></section><h3>Your task</h3>');
 replace('<p>${X(g(t.openingStringId))}</p>','<section class="arcade-story"><h3>Story</h3><p>${X(g(t.openingStringId))}</p>');
 replace('${Q(`Campaign Report`,`advance`,!1,`primary`)}','</section><section class="arcade-directions"><h3>Next step</h3>${Q(`Campaign Report`,`advance`,!1,`primary`)}</section>');
 html=html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 html=html.replace('</html>','<link rel="stylesheet" href="./arcade-civ.css"><script type="module" src="./campaign-runtime.js"></script></html>');
 const dir=root+'/build/math-civ';mkdirSync(dir,{recursive:true});
 writeFileSync(dir+'/index.html',html);writeFileSync(dir+'/game.js',code);
 copyFileSync(root+'/public/campaign-runtime.js',dir+'/campaign-runtime.js');
 copyFileSync(root+'/public/arcade-civ.css',dir+'/arcade-civ.css');
}
