import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const version=JSON.parse(readFileSync('package.json')).version;
const source=process.env.GITHUB_SHA;
if(!/^[a-f0-9]{40}$/.test(source||''))throw Error('GITHUB_SHA must identify the tested source.');
const files=['wrangler.jsonc','package.json','package-lock.json'];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const path=dir+'/'+e.name;if(e.isDirectory())walk(path);else files.push(path);}}
walk('build/assets');walk('build/worker');
writeFileSync('build/release.json',JSON.stringify({version,source,architecture:'cloudflare-durable-object'},null,2)+'\n');files.push('build/release.json');
writeFileSync('build/SHA256SUMS',files.sort().map(path=>createHash('sha256').update(readFileSync(path)).digest('hex')+'  '+path).join('\n')+'\n');
execFileSync('tar',['-czf',`build/math-arcade-${version}.tar.gz`,'build/SHA256SUMS',...files]);
console.log(`Packaged tested Worker and assets for ${source}: build/math-arcade-${version}.tar.gz`);
