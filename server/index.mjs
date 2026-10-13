import {dispatch} from './api.mjs';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Model,VERSION} from './model.mjs';
const root=resolve(import.meta.dirname,'..');
export function createApp({dbPath=process.env.ARCADE_DB_PATH||root+'/data/arcade.sqlite',password=process.env.ARCADE_TEACHER_PASSWORD,origin=process.env.PUBLIC_ORIGIN}={}){
 const model=new Model(dbPath,password);const limits=new Map();
 const server=createServer(async(req,res)=>{
  const ip=req.socket.remoteAddress,now=Date.now();let l=limits.get(ip);if(!l||now-l.at>60000){l={at:now,count:0,logins:0,joins:0};limits.set(ip,l);}if(limits.size>10000)for(const [k,v]of limits)if(now-v.at>60000)limits.delete(k);
  const cookies=Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=')));
  const host=req.headers.host||'localhost';const currentOrigin=origin||'http://'+host;
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  function send(status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
  function cookie(key,value){res.setHeader('Set-Cookie',`${key}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=259200${currentOrigin.startsWith('https:')?'; Secure':''}`);}
  try{
   const url=new URL(req.url,'http://'+host),path=url.pathname;
   if(path==='/health'){send(200,{ok:true,version:VERSION});return;}
   if(path.startsWith('/api/')){
    if(++l.count>30000){send(429,{error:'Too many requests. Please wait.'});return;}
    let body={};if(req.method==='POST'){
     if(req.headers.origin!==currentOrigin){send(403,{error:'Request origin not allowed.'});return;}
     if(!req.headers['content-type']?.startsWith('application/json')){send(415,{error:'JSON required.'});return;}
     let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4200000){send(413,{error:'Request too large.'});return;}}try{body=JSON.parse(raw||'{}');}catch{send(400,{error:'Invalid JSON.'});return;}
    }
    let data;
    if(path==='/api/login'&&req.method==='POST'){if(++l.logins>10){send(429,{error:'Too many login attempts. Wait a minute.'});return;}const t=model.tx(s=>model.login(s,body.password));cookie('teacher',t);send(200,{ok:true});return;}
    if(path==='/api/join'&&req.method==='POST'){if(++l.joins>120){send(429,{error:'Too many join attempts. Please wait a minute.'});return;}const t=model.tx(s=>model.join(s,body));cookie('student',t);send(200,{ok:true});return;}
    if(path==='/api/logout'&&req.method==='POST'){const key=body.role==='teacher'?'teacher':'student';model.tx(s=>{if(cookies[key]){const a=model.auth(s,cookies[key],key);s.tokens=s.tokens.filter(x=>x!==a);}});cookie(key,'');send(200,{ok:true});return;}
    data=dispatch(model,{method:req.method,path,url,body,cookies});
    send(200,data);return;
   }
   if(req.method!=='GET'&&req.method!=='HEAD'){send(405,{error:'Method not allowed.'});return;}
   let base=root+'/public',rel=path==='/'?'index.html':decodeURIComponent(path.slice(1));
   for(const game of ['journey','blackline'])if(path.startsWith('/'+game+'/')){base=root+'/build/'+game;rel=decodeURIComponent(path.slice(game.length+2));}
   if(path.startsWith('/coastal/')){base=root+'/build/coastal';rel=decodeURIComponent(path.slice(9));}
   if(path.startsWith('/ironbreak/')){base=root+'/build/ironbreak';rel=decodeURIComponent(path.slice(11));}
   if(path.startsWith('/nightfall/')){base=root+'/build/nightfall';rel=decodeURIComponent(path.slice(11));}
   if(path.startsWith('/vault7/')){base=root+'/build/vault7';rel=decodeURIComponent(path.slice(8));}
   if(/^\/(chrono|olivia|math-civ)\//.test(path)){const game=path.split('/')[1];model.tx(s=>{const {c,p}=model.student(s,cookies.student);if(p.activity?.game!==game||!p.activity.campaign||c.session.status==='ended')throw Object.assign(Error('Open this adventure from the arcade.'),{status:403});});base=root+'/build/'+game;rel=decodeURIComponent(path.slice(game.length+2));res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");}
   const file=resolve(base,rel);if(!file.startsWith(base+sep)||!existsSync(file)||!statSync(file).isFile()){send(404,{error:'Not found.'});return;}
   const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.wav':'audio/wav','.svg':'image/svg+xml'};
   res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':path.startsWith('/coastal/assets/')?'public, max-age=3600':'no-cache'});res.end(req.method==='HEAD'?undefined:readFileSync(file));
  }catch(error){send(error.status||500,{error:error.status?error.message:'The server could not complete this request.'});if(!error.status)console.error(error);}
 });
 server.on('close',()=>model.close());return {server,model};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 if(process.env.NODE_ENV==='production'&&!process.env.PUBLIC_ORIGIN)throw Error('PUBLIC_ORIGIN is required in production.');
 const {server}=createApp();server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Math Arcade '+VERSION+' listening on port '+(process.env.PORT||3000)));
}
