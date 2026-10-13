// Refresh immutable source snapshots. CI promotes them only after build and regression checks.
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=join(import.meta.dirname,'..'), manifest=JSON.parse(readFileSync(join(root,'vendor/manifest.json')));
const groups={journey:['williammcada/mathquest',['public/games/journey/','public/assets/journey/','src/cartridges/journey/model.js','src/cartridges/journey/encounters.js','src/cartridges/journey/specials.js']],blackline:['williammcada/mathquest',['public/games/blackline/','public/assets/blackline/']],kingsgate:['williammcada/mathquest',['public/games/kingsgate/','public/assets/kingsgate/']],'math-civ':['williammcada/Math-Civ',['PLAY-SEKIGAHARA-0.3.1.html']],math:['williammcada/MATH-ENGINE',['dist/']],coastal:['williammcada/mathquest',['public/games/aerial-shooter/','public/assets/aerial-shooter/','public/engine/']],vault7:['williammcada/mathquest',['public/assets/vault7/']],nightfall:['williammcada/mathquest',['public/games/nightfall/','public/assets/nightfall/','public/assets/false-haven/']],ironbreak:['williammcada/mathquest',['public/games/shooter/','public/assets/shooter/']],chrono:['williammcada/CHRONO-CIRCUIT',['public/']],olivia:['williammcada/OLIVIA-MAGIC-BRACELET-QUEST',['public/','src/']]};
const scratch=mkdtempSync(join(tmpdir(),'arcade-sources-')), repos=new Map(), next=[];
const git=(cwd,...args)=>execFileSync('git',args,{cwd,maxBuffer:64*1024*1024});
try {
 for(const [key,[repo,prefixes]] of Object.entries(groups)){
  let source=repos.get(repo);
  if(!source){const directory=join(scratch,repo.split('/')[1]);const local=process.env.ARCADE_SOURCE_ROOT&&join(process.env.ARCADE_SOURCE_ROOT,repo.split('/')[1]);git(scratch,'clone','--depth','1',local||`https://github.com/${repo}.git`,directory);source={directory,commit:git(directory,'rev-parse','HEAD').toString().trim()};repos.set(repo,source);}
  const old=manifest.files.filter(f=>f.dest.startsWith(`vendor/${key}/`));
  const required=new Set(old.map(f=>f.path));
  const entries=git(source.directory,'ls-tree','-r','--full-tree','HEAD').toString().trim().split('\n').map(line=>{const [metadata,path]=line.split('\t');const [mode,type,sha]=metadata.split(' ');return {mode,type,sha,path};});
  for(const path of required)if(!entries.some(e=>e.path===path))throw Error(`${repo}: required adapter dependency removed: ${path}`);
  for(const entry of entries.filter(e=>required.has(e.path)||prefixes.some(p=>e.path.startsWith(p)))){
   if(entry.type!=='blob'||entry.mode!=='100644')throw Error(`Unexpected source entry ${entry.path}`);
   const bytes=git(source.directory,'show',`${source.commit}:${entry.path}`),sha=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');if(sha!==entry.sha)throw Error('Source hash mismatch');
   const dest=key==='math'?`vendor/math/${entry.path.split('/').at(-1)}`:`vendor/${key}/${entry.path}`;
   const target=join(root,dest);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes);next.push({repo:repo.split('/')[1],path:entry.path,dest,sha});
  }
  manifest[key]={...manifest[key],repo,commit:source.commit};
 }
 manifest.files=next;writeFileSync(join(root,'vendor/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log('Canonical snapshots refreshed. Build and tests must pass before publishing.');
}finally{rmSync(scratch,{recursive:true,force:true});}
