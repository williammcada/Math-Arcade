export class Campaign{
 constructor(root,state,api,done){this.root=root;this.api=api;this.done=done;root.hidden=false;root.className='campaign-shell';root.innerHTML='<nav><button data-back>Save & back to arcade</button><span data-save>Saving is connected to your student profile.</span></nav><iframe title="Classroom adventure" allow="autoplay" src="/'+state.activity.game+'/index.html"></iframe>';const frame=root.querySelector('iframe');root.querySelector('[data-back]').onclick=async()=>{try{await frame.contentWindow.arcadeFlush?.();await api('leave',{});this.destroy();done();}catch(e){root.querySelector('[data-save]').textContent=e.message;}};}
 destroy(){this.root.innerHTML='';this.root.hidden=true;this.root.className='';}
}
