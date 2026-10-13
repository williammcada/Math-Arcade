import {readFileSync,writeFileSync,mkdirSync,rmSync,cpSync,readdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
await (await import('./fetch-vendor.mjs')).fetchMissing(root);
const manifest=JSON.parse(readFileSync(root+'/vendor/manifest.json'));
rmSync(root+'/build',{recursive:true,force:true});mkdirSync(root+'/build',{recursive:true});
for(const file of manifest.files){
 const bytes=readFileSync(root+'/'+file.dest);const hash=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 if(hash!==file.sha)throw Error('Upstream hash mismatch: '+file.dest);

}
// Math Engine (K–Algebra 2) practice bundle, byte-for-byte from MATH-ENGINE dist/. Server-side only:
// questions, answer checks and gate control all come from it; browsers receive rendered items.
mkdirSync(root+'/build/math',{recursive:true});
{const prov=JSON.parse(readFileSync(root+'/vendor/math/math-engine-practice.provenance.json','utf8')),bytes=readFileSync(root+'/vendor/math/math-engine-practice.js');
 if(createHash('sha256').update(bytes).digest('hex')!==prov.bundleSha256)throw Error('Math Engine bundle does not match its provenance.');
 writeFileSync(root+'/build/math/engine.js',bytes);writeFileSync(root+'/build/math/catalog.js',"export {catalog} from './engine.js';\n");}
cpSync(root+'/vendor/coastal/public',root+'/build/coastal',{recursive:true});
writeFileSync(root+'/build/provenance.json',JSON.stringify({version:'0.5.0',sources:{journey:manifest.journey,blackline:manifest.blackline,math:manifest.math,coastal:manifest.coastal,vault7:manifest.vault7,nightfall:manifest.nightfall,ironbreak:manifest.ironbreak,chrono:manifest.chrono,olivia:manifest.olivia,mathCiv:manifest['math-civ']},vendorFiles:manifest.files.length},null,2));

// Derive presentation-only exports from the pinned runtime; never load its old network/storage host.
cpSync(root+'/vendor/vault7/public',root+'/build/vault7',{recursive:true});
const vaultSource=readFileSync(root+'/vendor/vault7/public/stealth.js','utf8');
const between=(start,end)=>{const a=vaultSource.indexOf(start),b=vaultSource.indexOf(end,a);if(a<0||b<a)throw Error('Vault source extraction boundary changed');return vaultSource.slice(a,b);};
writeFileSync(root+'/build/vault7/fallback.js',between('export function fallbackScene(', '\nexport class StealthRuntime'));
writeFileSync(root+'/build/vault7/presentation.js',"import {crispCanvas} from '../coastal/engine/controls.js';\nimport {drawHardware} from './vault-art.js';\nimport {conePolygon,sensorActive} from './stealth-core.js';\nexport const presentation={\n"+between('  draw(){','  destroy(){')+'};\n');
rmSync(root+'/build/vault7/stealth.js');

console.log('Verified '+manifest.files.length+' upstream blobs; built shared math, Coastal Escape, Vault 7 and Nightfall.');

cpSync(root+'/vendor/nightfall/public',root+'/build/nightfall',{recursive:true});
for(const name of readdirSync(root+'/build/nightfall/games/nightfall').filter(x=>x.endsWith('.js')).map(x=>x.slice(0,-3))){
 const path=root+'/build/nightfall/games/nightfall/'+name+'.js';
 const code=readFileSync(path,'utf8').replace(/\?v=[0-9.]+/g,'').replace('../../engine/controls.js','../../../coastal/engine/controls.js').replaceAll('./assets/nightfall/','/nightfall/assets/nightfall/').replaceAll('./assets/false-haven/','/nightfall/assets/false-haven/');
 writeFileSync(path,code);
}

cpSync(root+'/vendor/ironbreak/public',root+'/build/ironbreak',{recursive:true});
const inputPath=root+'/build/ironbreak/games/shooter/input.js';writeFileSync(inputPath,readFileSync(inputPath,'utf8').replace('../../engine/held-input.js','../../../coastal/engine/held-input.js'));
import {buildChrono,buildOlivia} from './build-campaigns.mjs';
buildChrono(root);

await buildOlivia(root);

import {buildCiv} from './build-civ.mjs';
buildCiv(root);

cpSync(root+'/vendor/blackline/public',root+'/build/blackline',{recursive:true});
cpSync(root+'/vendor/journey',root+'/build/journey',{recursive:true});
cpSync(root+'/adapters/journey.js',root+'/build/journey/adapter.js');

import {buildAssets} from './build-assets.mjs';
buildAssets(root);
