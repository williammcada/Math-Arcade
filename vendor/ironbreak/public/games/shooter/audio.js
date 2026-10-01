// Original synthesized score and effects. No downloaded music or sound assets.
const NOTES=[0,7,12,7,3,10,15,10,5,12,17,12,3,10,7,3];
const BOSS=[0,0,7,12,1,1,8,13,0,7,10,12,6,3,1,7];
export const SOUND_MANIFEST={
  shot:[680,250,.045,'square',.025], 'spread-shot':[850,310,.065,'sawtooth',.022],
  'enemy-shot':[230,110,.11,'triangle',.06], hurt:[120,45,.2,'sawtooth',.10],
  'robot-hit':[1100,360,.04,'triangle',.045], 'robot-destroyed':[130,30,.24,'sawtooth',.09],
  jump:[220,580,.12,'square',.04], 'double-jump':[440,1000,.15,'triangle',.07], land:[110,55,.06,'triangle',.04],
  splash:[550,70,.15,'sawtooth',.025], repair:[440,1320,.22,'sine',.10],
  checkpoint:[392,1046,.34,'triangle',.10], respawn:[165,660,.38,'sine',.09],
  'robot-warning':[520,520,.075,'triangle',.05], 'hazard-warning':[780,640,.3,'square',.065],
  'hazard-impact':[100,25,.3,'sawtooth',.10], 'boss-high':[520,740,.3,'square',.07],
  'boss-low':[180,140,.4,'square',.08], 'boss-overhead':[800,220,.45,'triangle',.10],
  'boss-entry':[90,200,.7,'sawtooth',.075], 'boss-fire':[100,45,.2,'sawtooth',.08],
  'boss-destroyed':[300,50,.85,'sawtooth',.10], downed:[330,60,.6,'triangle',.12],
  'time-closed':[440,110,.7,'square',.08],
};
export class ShooterAudio{
  constructor(){this.enabled=true;this.paused=true;this.voices=new Set();this.track='level';this.index=0;this.lastEffects={};try{this.enabled=localStorage.getItem('mq-shooter-sound')!=='off';}catch{}}
  async start(){
    this.ctx||=new(window.AudioContext||window.webkitAudioContext)();
    if(!this.master){this.master=this.ctx.createGain();this.master.gain.value=.55;this.master.connect(this.ctx.destination);}
    this.paused=false;if(this.enabled){await this.ctx.resume();this.next=this.ctx.currentTime;}
    if(!this.timer)this.timer=setInterval(()=>this.schedule(),50);
  }
  tone(freq,end,duration,wave,volume,at=this.ctx?.currentTime,music=false){
    if(!this.ctx||!this.enabled||this.paused||this.voices.size>40)return;
    const o=this.ctx.createOscillator(),gain=this.ctx.createGain();o.type=wave;o.frequency.setValueAtTime(Math.max(20,freq),at);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+duration);
    gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),at+.004);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    o.connect(gain);gain.connect(this.master);o.music=music;this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();gain.disconnect();};o.start(at);o.stop(at+duration+.01);
  }
  schedule(){
    if(!this.ctx||!this.enabled||this.paused||this.ctx.state!=='running'||this.track==='silent')return;
    const interval=this.track==='boss'?.12:.15;if(this.next<this.ctx.currentTime-.2)this.next=this.ctx.currentTime;
    while(this.next<this.ctx.currentTime+.12){
      const n=this.index++,seq=this.track==='boss'?BOSS:NOTES,root=this.track==='boss'?110:130.81;
      this.tone(root*2**(seq[n%16]/12)*2,root*2**(seq[n%16]/12)*2,interval*.7,'square',.025,this.next,true);
      if(n%2===0)this.tone(root/2,root/2,interval*1.6,'triangle',.075,this.next,true);
      if(n%4===0)this.tone(95,30,.09,'sine',.11,this.next,true);
      else if(n%4===2)this.tone(850,140,.055,'sawtooth',.022,this.next,true);
      this.next+=interval;
    }
  }
  effect(type){
    const spec=SOUND_MANIFEST[type];if(!spec||!this.ctx)return;const t=this.ctx.currentTime;
    if(t-(this.lastEffects[type]??-10)<(type==='robot-hit'?.08:.035))return;
    this.lastEffects[type]=t;this.tone(...spec);
    if(type==='checkpoint'||type==='repair'||type==='boss-destroyed')for(let i=1;i<4;i++)this.tone(330*2**(i/3),330*2**(i/3),.18,'triangle',.07,t+i*.09);
  }
  music(track){if(this.track===track)return;this.track=track;this.index=0;for(const v of this.voices)if(v.music)try{v.stop();}catch{}if(this.ctx)this.next=this.ctx.currentTime+.02;}
  pause(value){this.paused=value;if(!this.ctx)return;if(value){for(const v of this.voices)try{v.stop();}catch{}this.ctx.suspend().catch(()=>{});}else if(this.enabled){this.next=this.ctx.currentTime;this.ctx.resume().catch(()=>{});}}
  async toggle(){this.enabled=!this.enabled;try{localStorage.setItem('mq-shooter-sound',this.enabled?'on':'off');}catch{}if(!this.enabled){await this.ctx?.suspend();}else if(this.ctx&&!this.paused){this.next=this.ctx.currentTime;await this.ctx.resume();}return this.enabled;}
  destroy(){clearInterval(this.timer);for(const v of this.voices)try{v.stop();}catch{}this.ctx?.close().catch(()=>{});}
}
