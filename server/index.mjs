import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Model,VERSION} from './model.mjs';
const root=resolve(import.meta.dirname,'..');
export function createApp({dbPath=process.env.ARCADE_DB_PATH||root+'/data/arcade.sqlite',password=process.env.ARCADE_TEACHER_PASSWORD,origin=process.env.PUBLIC_ORIGIN}={}){
 const model=new Model(dbPath,password);const limits=new Map();
 const server=createServer(async(req,res)=>{
  const ip=req.socket.remoteAddress,now=Date.now();let l=limits.get(ip);if(!l||now-l.at>60000){l={at:now,count:0,logins:0};limits.set(ip,l);}if(limits.size>10000)for(const [k,v]of limits)if(now-v.at>60000)limits.delete(k);
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
     let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>100000){send(413,{error:'Request too large.'});return;}}try{body=JSON.parse(raw||'{}');}catch{send(400,{error:'Invalid JSON.'});return;}
    }
    let data;
    if(path==='/api/login'&&req.method==='POST'){if(++l.logins>10){send(429,{error:'Too many login attempts. Wait a minute.'});return;}const t=model.tx(s=>model.login(s,body.password));cookie('teacher',t);send(200,{ok:true});return;}
    if(path==='/api/join'&&req.method==='POST'){const t=model.tx(s=>model.join(s,body));cookie('student',t);send(200,{ok:true});return;}
    if(path==='/api/logout'&&req.method==='POST'){const key=body.role==='teacher'?'teacher':'student';model.tx(s=>{if(cookies[key]){const a=model.auth(s,cookies[key],key);s.tokens=s.tokens.filter(x=>x!==a);}});cookie(key,'');send(200,{ok:true});return;}
    if(req.method==='GET'&&path==='/api/teacher')data=model.tx(s=>model.teacherView(s,cookies.teacher));
    else if(req.method==='GET'&&path==='/api/student')data=model.tx(s=>model.studentView(s,cookies.student));
    else if(req.method==='GET'&&path==='/api/roster')data=model.tx(s=>model.lookup(s,url.searchParams.get('code')));
    else if(req.method==='GET'&&path==='/api/export')data=model.tx(s=>model.export(s,cookies.teacher));
    else if(req.method==='POST')data=model.tx(s=>{
     const t=cookies.teacher,u=cookies.student;
     switch(path){
      case '/api/class':return {id:model.classCreate(s,t,body)};
      case '/api/roster':model.roster(s,t,body.classId,body.names);break;
      case '/api/assign':model.assign(s,t,body.classId,body);break;
      case '/api/session':model.session(s,t,body.classId,body.action);break;
      case '/api/availability':model.availability(s,t,body.classId,body.enabled);break;
      case '/api/approve':model.approve(s,t,body.id,body.allow);break;
      case '/api/delete':model.remove(s,t,body.classId,body.studentId,body.confirm);break;
      case '/api/preview':return model.preview(s,t,body.ids);
      case '/api/begin':return model.begin(s,u,body.game);
      case '/api/answer':return model.answer(s,u,body);
      case '/api/launch':return model.launch(s,u,body);
      case '/api/nightfall':return model.nightfall(s,u,body);
      case '/api/vault':return model.vault(s,u,body);
      case '/api/sync':return model.sync(s,u,body);
      case '/api/leave':return model.leave(s,u);
      default:throw Object.assign(Error('Not found.'),{status:404});
     }return {ok:true};
    });else {send(404,{error:'Not found.'});return;}
    send(200,data);return;
   }
   if(req.method!=='GET'&&req.method!=='HEAD'){send(405,{error:'Method not allowed.'});return;}
   let base=root+'/public',rel=path==='/'?'index.html':decodeURIComponent(path.slice(1));
   if(path.startsWith('/coastal/')){base=root+'/build/coastal';rel=decodeURIComponent(path.slice(9));}
   if(path.startsWith('/nightfall/')){base=root+'/build/nightfall';rel=decodeURIComponent(path.slice(11));}
   if(path.startsWith('/vault7/')){base=root+'/build/vault7';rel=decodeURIComponent(path.slice(8));}
   if(path==='/math-format.js'){base=root+'/build/math';rel='math-format.js';}
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
