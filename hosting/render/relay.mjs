// Math Arcade student front door on Render.
// A zero-dependency Node web service that runs the SAME relay logic as the
// Netlify Edge Function (netlify/edge-functions/arcade-proxy.js): one fixed
// upstream (the existing math-arcade Worker), same-origin POST checks,
// cookies and streamed bytes preserved, only upstream redirects rewritten.
// See docs/change-specs/render-front-door-2026-10-14.md.
import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {createGzip,createBrotliCompress,constants as z} from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {proxy,UPSTREAM} from '../../netlify/edge-functions/arcade-proxy.js';

export const RELAY_VERSION='1.0.0';
export const HEALTH_PATH='/__relay/health';
// Headers that describe one hop only, or that this relay recomputes.
const HOP=['connection','keep-alive','proxy-connection','transfer-encoding','upgrade','te','trailer','content-length','content-encoding'];
// Inbound headers added by Render's edge; the Worker must not see them.
const EDGE=['x-forwarded-for','x-forwarded-proto','x-forwarded-port','x-request-start','rndr-id','true-client-ip','render-proxy-ttl','cf-ray','cf-visitor','cf-ipcountry','cdn-loop'];
const COMPRESSIBLE=/^(text\/|application\/(json|javascript|xml|manifest\+json)|image\/svg\+xml)/i;

// The public origin is fixed by PUBLIC_ORIGIN when set; otherwise it is the
// HTTPS address Render routed this request to. Browsers cannot choose the
// Host of a page they are on, so the same-origin POST check stays meaningful.
export function publicOrigin(req,configured=process.env.PUBLIC_ORIGIN){
 if(configured)return new URL(configured).origin;
 const host=String(req.headers.host||'localhost');
 const proto=String(req.headers['x-forwarded-proto']||'').split(',')[0].trim()||(host.startsWith('localhost')||host.startsWith('127.')?'http':'https');
 return new URL(proto+'://'+host).origin;
}

export function toRequest(req,origin){
 const headers=new Headers();
 for(const [key,value] of Object.entries(req.headers)){
  if(value===undefined||HOP.includes(key)||EDGE.includes(key))continue;
  for(const v of [].concat(value))headers.append(key,v);
 }
 const hasBody=!['GET','HEAD'].includes(req.method);
 return new Request(origin+req.url,{method:req.method,headers,body:hasBody?Readable.toWeb(req):undefined,duplex:'half'});
}

function encoding(accept,type){
 if(!COMPRESSIBLE.test(type||''))return null;
 const a=String(accept||'');
 if(/\bbr\b/.test(a))return 'br';
 if(/\bgzip\b/.test(a))return 'gzip';
 return null;
}

export async function sendResponse(res,response,{method='GET',accept=''}={}){
 const headers={};
 for(const [key,value] of response.headers){if(!HOP.includes(key)&&key!=='set-cookie')headers[key]=value;}
 const cookies=response.headers.getSetCookie?.()||[];
 if(cookies.length)headers['set-cookie']=cookies;
 headers['x-arcade-entry']='render';
 delete headers['netlify-cdn-cache-control'];
 const body=method==='HEAD'||[204,304].includes(response.status)?null:response.body;
 const enc=body&&encoding(accept,response.headers.get('content-type'));
 if(enc){headers['content-encoding']=enc;headers.vary=[headers.vary,'Accept-Encoding'].filter(Boolean).join(', ');}
 res.writeHead(response.status,headers);
 if(!body){res.end();return;}
 const source=Readable.fromWeb(body);
 const stages=enc==='br'?[source,createBrotliCompress({params:{[z.BROTLI_PARAM_QUALITY]:4}}),res]:enc==='gzip'?[source,createGzip({level:6}),res]:[source,res];
 await pipeline(...stages);
}

export function createRelay({fetcher=fetch,origin}={}){
 return createServer(async(req,res)=>{
  try{
   if(req.url===HEALTH_PATH){
    res.writeHead(200,{'content-type':'application/json','cache-control':'no-store','x-arcade-entry':'render'});
    res.end(JSON.stringify({ok:true,relay:RELAY_VERSION,upstream:UPSTREAM,source:process.env.RENDER_GIT_COMMIT||'local'}));
    return;
   }
   const request=toRequest(req,publicOrigin(req,origin));
   const response=await proxy(request,fetcher);
   await sendResponse(res,response,{method:req.method,accept:req.headers['accept-encoding']});
  }catch(error){
   if(!res.headersSent){res.writeHead(502,{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'});res.end('The classroom service could not be reached. Please try again.');}
   else res.destroy(error);
  }
 });
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const port=Number(process.env.PORT||10000);
 createRelay().listen(port,'0.0.0.0',()=>console.log(`Math Arcade Render relay ${RELAY_VERSION} on port ${port} → ${UPSTREAM}`));
}
