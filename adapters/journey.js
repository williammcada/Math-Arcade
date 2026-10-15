import {BrawlModel} from './src/cartridges/journey/model.js';
import {JourneyRenderer} from './public/games/journey/renderer.js';
import {JourneyAudio} from './public/games/journey/audio.js';
import {HEROES,UPGRADES,LIMITS} from './public/games/journey/config.js';
export {HEROES,UPGRADES};
const hydrate=s=>Object.assign(Object.create(BrawlModel.prototype),{s:s.model});
export function createJourney(run={}){
 const hero=run.hero||'wukong',upgrade=run.upgrade||'power';
 if(!HEROES.some(x=>x.id===hero)||!UPGRADES.some(x=>x.id===upgrade))throw Object.assign(Error('Choose a listed hero and upgrade.'),{status:400});
 const m=new BrawlModel({runId:run.runId,teamId:'arcade-solo',expiresAt:Number.MAX_SAFE_INTEGER,members:[{id:'solo',alias:'You'}]},0);
 m.connect('solo',0);m.reserve('solo',hero,0);m.ready('solo',[upgrade],0);
 return {model:m.s,time:0,outcome:null,events:[],held:{jump:false,magic:false}};
}
export function stepJourney(s,keys,dt){
 if(s.outcome)return;const m=hydrate(s),now=m.s.lastAt;
 m.input('solo',m.player('solo').epoch,{seq:m.player('solo').seq+1,x:Number(!!keys.right)-Number(!!keys.left),y:Number(!!keys.down)-Number(!!keys.up),attack:!!keys.attack,jump:!!keys.jump&&!s.held.jump,magic:!!keys.magic&&!s.held.magic},now);
 s.held={jump:!!keys.jump,magic:!!keys.magic};m.advance(now+dt*1000);s.time=m.s.activeMs/1000;
 if(m.s.phase==='terminal')s.outcome=m.s.result.outcome==='victory'?'success':m.s.result.outcome==='retreat'?'timed_out':'lost';
}
const view=s=>hydrate(s).snapshot(s.model.lastAt),renderers=new WeakMap();
class Audio{
 constructor(){this.audio=new JourneyAudio();this.enabled=true;this.paused=true;}
 // v0.8.0: Journey's synth is very quiet on iPad speakers. Route it through a 3× gain and a limiter
 // by giving its context a louder "destination" (Arcade-owned wrapper; the canonical game is unchanged).
 boost(){const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC||this.audio.ctx)return;const ctx=new AC(),real=ctx.destination,gain=ctx.createGain(),limit=ctx.createDynamicsCompressor();gain.gain.value=3;limit.threshold.value=-6;limit.knee.value=6;limit.ratio.value=12;limit.attack.value=.003;limit.release.value=.15;gain.connect(limit);limit.connect(real);Object.defineProperty(ctx,'destination',{value:gain});this.audio.ctx=ctx;}
 async start(){if(this.enabled){this.boost();await this.audio.unlock();}}
 async toggle(){this.enabled=!this.enabled;this.audio.music=this.audio.effects=this.enabled;this.audio.silence();if(this.enabled)await this.start();}
 pause(on){this.paused=on;this.audio.stopped=on;if(on)this.audio.silence();}
 update(s){if(this.enabled)this.audio.sync({...view(s),paused:this.paused});}
 music(){} alarm(){} effect(){}
 destroy(){this.audio.silence();clearInterval(this.audio.timer);this.audio.ctx?.close();}
}
export const journeyAdapter={
 title:'Journey to the West — Single Player',width:960,height:420,
 canvasLabel:'Single-player Journey to the West combat',
 controlProfile:{left:[['up','▲'],['left','◀'],['down','▼'],['right','▶']],right:[['attack','Attack'],['jump','Jump'],['magic','Magic']],keys:{w:'up',arrowup:'up',a:'left',arrowleft:'left',s:'down',arrowdown:'down',d:'right',arrowright:'right',j:'attack',z:'attack',k:'jump',x:'jump',' ':'jump',l:'magic',c:'magic'},help:'Arrows/WASD move. J/Z attack, K/Space/X jump, L/C magic. Escape pauses. Three lives; three active minutes. Break crates, collect elixir for magic and baozi for health.'},
 create:createJourney,step:stepJourney,createAudio:()=>new Audio(),
 loadArt:async()=>{const renderer=new JourneyRenderer(document.createElement('canvas'));await Promise.all(Object.values(renderer.images).map(img=>img.decode()));return renderer.images;},
 render(ctx,s,art){let r=renderers.get(ctx.canvas);if(!r){r=new JourneyRenderer(ctx.canvas);r.images=art;renderers.set(ctx.canvas,r);}r.set(view(s));r.draw();},
 hud:s=>{const p=s.model.players.solo;return `HP ${Math.ceil(p.hp)} · Lives ${p.lives} · Magic ${p.magic}/${p.capacity} · ${Math.ceil((LIMITS.active-s.model.activeMs)/1000)}s`;},
 objective:s=>s.model.phase==='launch'?'Get ready · '+Math.ceil(s.model.launchMs/1000):(s.model.level?.name||'Journey'),
 resultLabels:{success:'Nezha defeated',lost:'Journey ended',timed_out:'Journey time complete'}
};
