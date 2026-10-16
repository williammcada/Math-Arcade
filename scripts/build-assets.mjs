import {cpSync,mkdirSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
export function buildAssets(root){
 const dest=root+'/build/assets';rmSync(dest,{recursive:true,force:true});mkdirSync(dest,{recursive:true});
 cpSync(root+'/public',dest,{recursive:true});
 cpSync(root+'/build/answer-pad.js',dest+'/answer-pad.js'); // U-18 universal answer pad
 for(const game of ['journey','blackline','kingsgate','blackout','coastal','vault7','nightfall','ironbreak','chrono','olivia','math-civ'])cpSync(root+'/build/'+game,dest+'/'+game,{recursive:true});
 // Only presentation assets are uploaded. Never copy server code, source trees or saves.
 const version=JSON.parse(readFileSync(root+'/package.json')).version;
 for(const game of ['chrono','olivia','math-civ']){
  const file=dest+'/'+game+'/index.html';let html=readFileSync(file,'utf8');
  html=html.replace(/<title>(.*?)<\/title>/s,(_,title)=>`<title>${title} · Math Arcade v${version}</title>`)
   .replace('</body>',`<div style="position:fixed;bottom:2px;right:8px;z-index:9999;font:10px sans-serif;pointer-events:none;background:#101827;color:#fff;padding:2px 5px;border-radius:3px">Math Arcade v${version} · A WILLIAM MCADA PRODUCT</div></body>`);
  writeFileSync(file,html);
  // Node's reference host serves the same generated HTML as the Worker.
  writeFileSync(root+'/build/'+game+'/index.html',html);
 }
}
if(process.argv[1]===import.meta.filename)buildAssets(resolve(import.meta.dirname,'..'));
