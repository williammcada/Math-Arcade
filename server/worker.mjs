import {DurableObject} from 'cloudflare:workers';
import {Model,VERSION} from './core-model.mjs';
import {DurableStore} from './durable-store.mjs';
import {dispatch} from './api.mjs';

const campaign=/^\/(chrono|olivia|math-civ)(?:\/|$)/;
const policy="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
const adventurePolicy="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'";
const json=(status,data)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
function secure(response,adventure=false){
 const r=new Response(response.body,response);
 r.headers.set('X-Content-Type-Options','nosniff');r.headers.set('Referrer-Policy','same-origin');
 r.headers.set('Content-Security-Policy',adventure?adventurePolicy:policy);
 if(adventure)r.headers.set('Cache-Control','private, no-store');
 return r;
}
function canonical(request){
 const url=new URL(request.url);
 let path;try{path=decodeURIComponent(url.pathname);}catch{fail(400,'Invalid path.');}
 // Assets and authorization must see exactly the same path, including encoded slashes.
 if(path.includes('\\')||path.includes('\0')||path.includes('%')||path.split('/').some(p=>p==='.'||p==='..'))fail(400,'Invalid path.');
 url.pathname=path;return new Request(url,request);
}
async function bodyJSON(request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))fail(415,'JSON required.');
 if(Number(request.headers.get('content-length'))>4200000)fail(413,'Request too large.');
 const reader=request.body?.getReader(),decoder=new TextDecoder();let raw='',size=0;
 if(reader)while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4200000){await reader.cancel();fail(413,'Request too large.');}raw+=decoder.decode(value,{stream:true});}
 raw+=decoder.decode();let body;try{body=JSON.parse(raw||'{}');}catch{fail(400,'Invalid JSON.');}
 if(!body||typeof body!=='object'||Array.isArray(body))fail(400,'JSON object required.');return body;
}

export class ArcadeWorkspace extends DurableObject {
 constructor(ctx,env){
  super(ctx,env);this.env=env;this.limits=new Map();
  this.model=new Model(new DurableStore(ctx.storage),env.ARCADE_TEACHER_PASSWORD);
 }
 async fetch(request){
  try{
   const url=new URL(request.url),path=url.pathname,method=request.method;
   const cookies=Object.fromEntries((request.headers.get('cookie')||'').split(';').map(x=>x.trim().split('=')));
   const m=this.model;
   if(campaign.test(path)){
    const game=path.split('/')[1];m.tx(s=>{const {c,p}=m.student(s,cookies.student);if(p.activity?.game!==game||!p.activity.campaign||c.session.status==='ended')fail(403,'Open this adventure from the arcade.');});
    return new Response(null,{status:204});
   }
   const now=Date.now(),ip=request.headers.get('CF-Connecting-IP')||'local';
   let l=this.limits.get(ip);if(!l||now-l.at>=60000){l={at:now,count:0,logins:0,joins:0};this.limits.set(ip,l);}
   if(this.limits.size>10000)for(const [k,v]of this.limits)if(now-v.at>=60000)this.limits.delete(k);
   if(++l.count>30000)fail(429,'Too many requests. Please wait.');
   let body={};
   if(method==='POST'){
    if(request.headers.get('origin')!==url.origin)fail(403,'Request origin not allowed.');
    if(path==='/api/login'&&++l.logins>10)fail(429,'Too many login attempts. Wait a minute.');
    if(path==='/api/join'&&++l.joins>120)fail(429,'Too many join attempts. Please wait a minute.');
    body=await bodyJSON(request);
   }
   const cookie=(key,value)=>{const r=json(200,{ok:true});r.headers.set('Set-Cookie',`${key}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${value?259200:0}${url.protocol==='https:'?'; Secure':''}`);return r;};
   if(method==='POST'&&path==='/api/login')return cookie('teacher',m.tx(s=>m.login(s,body.password)));
   if(method==='POST'&&path==='/api/join')return cookie('student',m.tx(s=>m.join(s,body)));
   if(method==='POST'&&path==='/api/logout'){
    const key=body.role==='teacher'?'teacher':'student';m.tx(s=>{if(cookies[key]){const a=m.auth(s,cookies[key],key);s.tokens=s.tokens.filter(x=>x!==a);}});return cookie(key,'');
   }
   return json(200,dispatch(m,{method,path,url,body,cookies}));
  }catch(e){if(!e.status)console.error('Arcade request failed:',e.message);return json(e.status||500,{error:e.status?e.message:'The server could not complete this request.'});}
 }
}

export default {
 async fetch(incoming,env){
  try{
   const request=canonical(incoming),url=new URL(request.url),path=url.pathname;
   if(env.PUBLIC_ORIGIN&&url.origin!==env.PUBLIC_ORIGIN)return secure(json(403,{error:'Host not allowed.'}));
   if(path==='/health')return secure(json(200,{ok:true,version:VERSION,architecture:'cloudflare-durable-object',source:env.SOURCE_COMMIT||'local'}));
   if(path.startsWith('/api/')||campaign.test(path)){
    const stub=env.ARCADE.get(env.ARCADE.idFromName('teacher-workspace-v1'));
    const result=await stub.fetch(request);
    if(path.startsWith('/api/')||result.status!==204)return secure(result);
   }
   if(!['GET','HEAD'].includes(request.method))return secure(json(405,{error:'Method not allowed.'}));
   // html_handling:none prevents asset redirects from bypassing protected paths.
   // Resolve only the app root and authorized campaign directory entry points here.
   const assetURL=new URL(request.url);
   if(path==='/')assetURL.pathname='/index.html';
   else if(/^\/(chrono|olivia|math-civ)\/$/.test(path))assetURL.pathname=path+'index.html';
   return secure(await env.ASSETS.fetch(new Request(assetURL,request)),campaign.test(path));
  }catch(e){return secure(json(e.status||503,{error:e.status?e.message:'The classroom service is unavailable. Please try again.'}));}
 }
};
