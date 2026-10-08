// Shared command dispatch for the Node reference host and Cloudflare Worker.
export function dispatch(model,{method,path,url,body,cookies}){
 let data;
    if(method==='GET'&&path==='/api/teacher')data=model.tx(s=>model.teacherView(s,cookies.teacher));
    else if(method==='GET'&&path==='/api/student')data=model.tx(s=>model.studentView(s,cookies.student));
    else if(method==='GET'&&path==='/api/roster')data=model.tx(s=>model.lookup(s,url.searchParams.get('code')));
    else if(method==='GET'&&path==='/api/export')data=model.tx(s=>model.export(s,cookies.teacher));
    else if(method==='POST')data=model.tx(s=>{
     const t=cookies.teacher,u=cookies.student;
     switch(path){
      case '/api/class':return {id:model.classCreate(s,t,body)};
      case '/api/roster':model.roster(s,t,body.classId,body.names);break;
      case '/api/assign':model.assign(s,t,body.classId,body);break;
      case '/api/new-password':return model.newPassword(s,t,body.classId);
      case '/api/session':model.session(s,t,body.classId,body.action);break;
      case '/api/availability':model.availability(s,t,body.classId,body.enabled);break;
      case '/api/approve':model.approve(s,t,body.id,body.allow);break;
      case '/api/delete':model.remove(s,t,body.classId,body.studentId,body.confirm);break;
      case '/api/preview':return model.preview(s,t,body.ids);
      case '/api/begin':return model.begin(s,u,body.game);
      case '/api/answer':return model.answer(s,u,body);
      case '/api/campaign':return model.campaign(s,u,body);
      case '/api/launch':return model.launch(s,u,body);
      case '/api/extra':return model.extra(s,u,body);
      case '/api/ironbreak':return model.ironbreak(s,u,body);
      case '/api/nightfall':return model.nightfall(s,u,body);
      case '/api/vault':return model.vault(s,u,body);
      case '/api/sync':return model.sync(s,u,body);
      case '/api/leave':return model.leave(s,u);
      default:throw Object.assign(Error('Not found.'),{status:404});
     }return {ok:true};
    });else throw Object.assign(Error('Not found.'),{status:404});
 return data;
}
