function installArcadeCiv(app){
 const dispatch=app.dispatch.bind(app),action=app.action.bind(app),render=app.render.bind(app);
 app.dispatch=function(event){
  if(window.arcadePaused)return;
  const previous=this.state;dispatch(event);
  if(this.state!==previous&&!this.practicing)void this.save('autosave');
 };
 app.action=function(command){
  if(window.arcadePaused)return;
  if(command==='arcade-clear-campaigns'){
   const count=Object.keys(this.slots).length,backups=Object.keys(Sn.backups).length;
   return this.confirm('Delete all Math Civ campaigns?',`Delete ${count} saved slots, ${backups} backup records and the current campaign for your student profile? Export any campaigns you want to keep first. This cannot be undone. Other games and students are unchanged.`,async()=>{
    clearTimeout(this.aiTimer);this.aiTimer=null;await this.saveChain;
    this.state=null;this.labReturn=null;En({version:1,saves:{},backups:{}});this.slots={};this.view='saves';this.render();
    try{await window.arcadeFlush();this.message('Math Civ campaigns deleted.');}catch{this.message('Deletion has not reached the classroom server. Keep this page open and reconnect.');}
   });
  }
  return action(command);
 };
 app.render=function(){
  render();
  if(this.view==='saves'){
   const section=document.createElement('section');section.className='arcade-directions';
   section.innerHTML='<h3>Manage Math Civ campaigns</h3><p>Export any saved slots you want to keep before deleting. This removes all Math Civ campaigns for your student profile, including the current campaign and backup records.</p><button data-action="arcade-clear-campaigns">Delete all Math Civ campaigns</button>';
   this.root.querySelector('.full-panel')?.append(section);
  }
  if(window.arcadePaused){clearTimeout(this.aiTimer);this.aiTimer=null;}
 };
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
