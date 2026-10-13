import test from 'node:test';import assert from 'node:assert/strict';
import {request as httpRequest} from 'node:http';
import {gunzipSync,brotliDecompressSync} from 'node:zlib';
import {createRelay,publicOrigin,HEALTH_PATH} from '../hosting/render/relay.mjs';
import {UPSTREAM} from '../netlify/edge-functions/arcade-proxy.js';

const ORIGIN='https://mcada-matharcade.onrender.com';
async function withRelay(fetcher,fn){
 const server=createRelay({fetcher,origin:ORIGIN});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{return await fn(server.address().port);}finally{await new Promise(r=>server.close(r));}
}
function call(port,{method='GET',path='/',headers={},body}={}){
 return new Promise((resolve,reject)=>{
  const req=httpRequest({host:'127.0.0.1',port,method,path,headers},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));});
  req.on('error',reject);if(body)req.write(body);req.end();
 });
}

test('Render relay forwards POST body, cookies and rewritten origin; returns every Set-Cookie',async()=>{
 await withRelay(async upstream=>{
  assert.equal(upstream.url,UPSTREAM+'/api/login?x=1');
  assert.equal(upstream.headers.get('origin'),UPSTREAM);
  assert.equal(upstream.headers.get('cookie'),'teacher=abc');
  assert.equal(upstream.headers.get('x-forwarded-for'),null);
  assert.equal(upstream.headers.get('rndr-id'),null);
  assert.equal(await upstream.text(),'{"password":"fixture-only"}');
  const h=new Headers({'content-type':'application/json'});h.append('set-cookie','teacher=new; HttpOnly; SameSite=Strict; Path=/; Secure');h.append('set-cookie','student=; Max-Age=0; Path=/');
  return new Response('{"ok":true}',{headers:h});
 },async port=>{
  const r=await call(port,{method:'POST',path:'/api/login?x=1',headers:{origin:ORIGIN,'content-type':'application/json',cookie:'teacher=abc','x-forwarded-for':'1.2.3.4','rndr-id':'abc'},body:'{"password":"fixture-only"}'});
  assert.equal(r.status,200);
  assert.equal(r.headers['set-cookie'].length,2);
  assert.match(r.headers['set-cookie'][0],/HttpOnly/);
  assert.match(r.headers['cache-control'],/no-store/);
  assert.equal(r.headers['x-arcade-entry'],'render');
  assert.equal(r.headers['netlify-cdn-cache-control'],undefined);
  assert.deepEqual(JSON.parse(r.body),{ok:true});
 });
});

test('Render relay refuses off-origin writes without contacting the Worker',async()=>{
 await withRelay(()=>{throw Error('Must not call upstream');},async port=>{
  for(const origin of ['https://evil.invalid','null','https://mcada-matharcade.netlify.app']){
   const r=await call(port,{method:'POST',path:'/api/delete',headers:{origin,'content-type':'application/json'},body:'{}'});
   assert.equal(r.status,403);
  }
  assert.equal((await call(port,{method:'PUT',path:'/api/x',headers:{origin:ORIGIN},body:'{}'})).status,405);
 });
});

test('Render relay streams binary bytes unchanged and compresses text for browsers that accept it',async()=>{
 const bytes=new Uint8Array(4096).map((_,i)=>i%251);
 const text='const message='+JSON.stringify('x'.repeat(5000))+';';
 await withRelay(async upstream=>{
  const path=new URL(upstream.url).pathname;
  if(path==='/art.webp')return new Response(bytes,{headers:{'content-type':'image/webp','content-length':'4096'}});
  return new Response(text,{headers:{'content-type':'text/javascript','content-encoding':'gzip'}}); // undici has already decoded it
 },async port=>{
  const img=await call(port,{path:'/art.webp',headers:{'accept-encoding':'gzip, br'}});
  assert.equal(img.headers['content-encoding'],undefined);
  assert.deepEqual(new Uint8Array(img.body),bytes);
  const br=await call(port,{path:'/app.js',headers:{'accept-encoding':'gzip, deflate, br'}});
  assert.equal(br.headers['content-encoding'],'br');assert.match(br.headers.vary,/Accept-Encoding/);
  assert.equal(brotliDecompressSync(br.body).toString(),text);assert.ok(br.body.length<text.length/4);
  const gz=await call(port,{path:'/app.js',headers:{'accept-encoding':'gzip'}});
  assert.equal(gunzipSync(gz.body).toString(),text);
  const plain=await call(port,{path:'/app.js'});
  assert.equal(plain.headers['content-encoding'],undefined);assert.equal(plain.body.toString(),text);
  const head=await call(port,{method:'HEAD',path:'/app.js',headers:{'accept-encoding':'gzip'}});
  assert.equal(head.status,200);assert.equal(head.body.length,0);
 });
});

test('Render relay rewrites only same-upstream redirects to its public address and reports an unreachable Worker',async()=>{
 let mode='same';
 await withRelay(async()=>{
  if(mode==='down')throw Error('offline');
  return new Response(null,{status:302,headers:{location:mode==='same'?UPSTREAM+'/index.html?code=ABCD':'https://other.invalid/'}});
 },async port=>{
  assert.equal((await call(port,{path:'/?code=ABCD'})).headers.location,ORIGIN+'/index.html?code=ABCD');
  mode='other';assert.equal((await call(port,{path:'/'})).status,502);
  mode='down';assert.equal((await call(port,{path:'/'})).status,503);
 });
});

test('Render relay health check answers locally without contacting the Worker',async()=>{
 await withRelay(()=>{throw Error('Must not call upstream');},async port=>{
  const r=await call(port,{path:HEALTH_PATH});
  assert.equal(r.status,200);const body=JSON.parse(r.body);
  assert.equal(body.ok,true);assert.equal(body.upstream,UPSTREAM);
 });
});

test('public origin comes from Render routing unless fixed by PUBLIC_ORIGIN',()=>{
 assert.equal(publicOrigin({headers:{host:'mcada-matharcade.onrender.com','x-forwarded-proto':'https'}},''),ORIGIN);
 assert.equal(publicOrigin({headers:{host:'mcada-matharcade.onrender.com'}},''),ORIGIN);
 assert.equal(publicOrigin({headers:{host:'localhost:10000'}},''),'http://localhost:10000');
 assert.equal(publicOrigin({headers:{host:'anything.invalid'}},'https://fixed.example/'),'https://fixed.example');
});
