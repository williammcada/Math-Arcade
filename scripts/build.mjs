import {readFileSync,writeFileSync,mkdirSync,rmSync,cpSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(readFileSync(root+'/vendor/manifest.json'));
rmSync(root+'/build',{recursive:true,force:true});mkdirSync(root+'/build',{recursive:true});
for(const file of manifest.files){
 const bytes=readFileSync(root+'/'+file.dest);const hash=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 if(hash!==file.sha)throw Error('Upstream hash mismatch: '+file.dest);
 if(file.dest.startsWith('vendor/math/')){
  let code=bytes.toString();if(file.path.endsWith('.ts'))code=stripTypeScriptTypes(code,{mode:'transform'});
  code=code.replace(/(from\s+['"])(\.[^'"]+)(['"])/g,(all,a,p,z)=>a+(p.endsWith('.js')?p:p+'.js')+z);
  const target=root+'/build/math/'+file.path.replace(/^src\//,'').replace(/\.ts$/,'.js');mkdirSync(dirname(target),{recursive:true});writeFileSync(target,code);
 }
}
cpSync(root+'/vendor/coastal/public',root+'/build/coastal',{recursive:true});
writeFileSync(root+'/build/provenance.json',JSON.stringify({version:'0.1.0-alpha.1',sources:{math:manifest.math,coastal:manifest.coastal},vendorFiles:manifest.files.length},null,2));
console.log('Verified '+manifest.files.length+' upstream blobs; compiled shared math and Coastal Escape.');
