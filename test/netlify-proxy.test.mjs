import test from 'node:test';import assert from 'node:assert/strict';
import {proxy,UPSTREAM} from '../netlify/edge-functions/arcade-proxy.js';
test('Netlify entry preserves queries, cookies, body and same-origin security without exposing upstream',async()=>{
 const req=new Request('https://arcade-test.netlify.app/api/login?x=1',{method:'POST',headers:{origin:'https://arcade-test.netlify.app','content-type':'application/json',cookie:'teacher=abc'},body:'{"password":"fixture-only"}'});
 const r=await proxy(req,async upstream=>{assert.equal(upstream.url,UPSTREAM+'/api/login?x=1');assert.equal(upstream.headers.get('origin'),UPSTREAM);assert.equal(upstream.headers.get('cookie'),'teacher=abc');assert.equal(await upstream.text(),'{"password":"fixture-only"}');return new Response('{"ok":true}',{headers:{'set-cookie':'teacher=new; HttpOnly; SameSite=Strict; Path=/; Secure','content-type':'application/json'}});});
 assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(r.headers.get('X-Arcade-Entry'),'netlify');assert.deepEqual(await r.json(),{ok:true});
 for(const origin of ['https://evil.invalid','null','']){const bad=new Request('https://arcade-test.netlify.app/api/delete',{method:'POST',headers:{origin},body:'{}'});assert.equal((await proxy(bad,()=>{throw Error('Must not call upstream');})).status,403);}
});
test('Netlify entry streams game bytes and rewrites only upstream redirects',async()=>{
 const req=new Request('https://arcade-test.netlify.app/?code=ABCD');
 assert.equal(await (await proxy(req,async r=>new Response(new Uint8Array([1,2,3])))).arrayBuffer().then(b=>b.byteLength),3);
 const redirect=await proxy(req,async()=>new Response(null,{status:302,headers:{location:UPSTREAM+'/index.html?code=ABCD'}}));assert.equal(redirect.headers.get('location'),'https://arcade-test.netlify.app/index.html?code=ABCD');
 assert.equal((await proxy(req,async()=>new Response(null,{status:302,headers:{location:'https://other.invalid'}}))).status,502);
 assert.equal((await proxy(req,async()=>{throw Error('offline');})).status,503);
});
