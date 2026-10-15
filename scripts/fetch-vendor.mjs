// Materialize omitted immutable snapshots from the canonical source, never from main.
// The manifest's Git blob digest is checked before bytes are accepted.
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';
export async function fetchMissing(root){
 const m=JSON.parse(readFileSync(root+'/vendor/manifest.json'));
 // Private upstream repositories: sign in with the read-only key when one is set.
 const token=process.env.UPSTREAM_READ_TOKEN?.trim(),headers=token?{Authorization:'token '+token}:{};
 const missing=m.files.filter(f=>!existsSync(root+'/'+f.dest));
 let cursor=0;
 await Promise.all(Array.from({length:6},async()=>{while(cursor<missing.length){const f=missing[cursor++],group=f.dest.split('/')[1],source=m[group];
  if(!/^vendor\/[a-z0-9-]+\//.test(f.dest)||f.dest.includes('..')||!/^williammcada\/[a-zA-Z0-9-]+$/.test(source?.repo||'')||!/^\w{40}$/.test(source?.commit||''))throw Error('Invalid source manifest');
  const url=`https://raw.githubusercontent.com/${source.repo}/${source.commit}/${f.path}`;
  let response;for(let attempt=0;attempt<3;attempt++){response=await fetch(url,{headers});if(response.ok)break;}if(!response.ok)throw Error('Source download failed: '+f.path+' '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer()),sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');if(sha!==f.sha)throw Error('Source integrity failed: '+f.dest);
  mkdirSync(dirname(root+'/'+f.dest),{recursive:true});writeFileSync(root+'/'+f.dest,bytes);
 }}));
 if(missing.length)console.log('Materialized '+missing.length+' immutable, digest-verified source files.');
}
