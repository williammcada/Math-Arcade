function installArcadeCiv(app){
 const dispatch=app.dispatch.bind(app),action=app.action.bind(app),render=app.render.bind(app);
 app.dispatch=function(event){
  if(window.arcadePaused)return;
  const previous=this.state;dispatch(event);
  if(this.state!==previous&&!this.practicing)void this.save('autosave');
 };
 app.action=function(command){if(window.arcadePaused)return;return action(command);};
 app.render=function(){render();if(window.arcadePaused){clearTimeout(this.aiTimer);this.aiTimer=null;}};
 window.arcadePause=paused=>{
  clearTimeout(app.aiTimer);app.aiTimer=null;
  if(paused){if(app.state&&!app.practicing)void app.save('autosave');}
  else if(!app.root.querySelector('dialog[open]'))app.render();
 };
 window.arcadePrepareExit=async()=>{
  clearTimeout(app.aiTimer);app.aiTimer=null;
  if(app.state&&!app.practicing)await app.save('autosave');
  await app.saveChain;
 };
}
