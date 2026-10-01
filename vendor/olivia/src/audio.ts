import {musicStepMs,skyBeat} from './music';
export class AudioService {
 theme=0;
 setTheme(theme:number){if(this.theme===theme)return;this.theme=theme;this.beat=0;if(this.timer){clearInterval(this.timer);this.timer=setInterval(()=>this.tick(),musicStepMs(this.theme));}}
 context?:AudioContext;timer?:ReturnType<typeof setInterval>;beat=0;music=.16;sfx=.4;readAloud=true;duckUntil=0;
 unlock(){if(!this.context){try{this.context=new AudioContext();}catch{return;}}void this.context.resume();if(!this.timer)this.timer=setInterval(()=>this.tick(),musicStepMs(this.theme));}
 tone(freq:number,duration=.12,volume=this.sfx,type:OscillatorType='triangle'){if(!this.context||this.context.state!=='running'||volume<=0)return;const c=this.context,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume*.12,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+duration);}
 tick(){if(document.hidden)return;if(this.theme===3){const v=Date.now()<this.duckUntil?this.music*.25:this.music,score=skyBeat(this.beat++);for(const n of score.notes)this.tone(n.frequency,n.duration,v*n.volume,n.wave);if(score.kick)this.drum('kick',v);if(score.snare)this.drum('snare',v);if(score.hat)this.drum('hat',v);return;}const tracks=[[523,659,784,659,587,698,880,698,659,784,1047,784,587,659,523,0],[392,523,587,659,587,523,440,0,392,440,523,659,784,659,523,0],[440,0,659,0,523,0,494,0,440,587,659,0,784,659,523,0],[659,784,1047,880,784,659,587,659,784,880,1047,1175,1047,880,784,0]];const notes=tracks[this.theme]||tracks[0],n=notes[this.beat%notes.length];const v=Date.now()<this.duckUntil?this.music*.25:this.music;if(n)this.tone(n,this.theme===2?.45:.22,v,this.theme===2?'sine':'triangle');if(this.beat%4===0)this.tone([131,175,165,147][Math.floor(this.beat/8)%4]*(this.theme===2?.84:1),.5,v*.65,'sine');this.beat++;}
 private drum(kind:'kick'|'snare'|'hat',volume:number){
  const c=this.context;if(!c||c.state!=='running'||volume<=0)return;
  const g=c.createGain(),duration=kind==='kick'?.14:kind==='snare'?.08:.035;
  g.gain.setValueAtTime(volume*(kind==='hat'?.015:.055),c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);g.connect(c.destination);
  if(kind==='kick'){const o=c.createOscillator();o.frequency.setValueAtTime(135,c.currentTime);o.frequency.exponentialRampToValueAtTime(43,c.currentTime+.12);o.connect(g);o.start();o.stop(c.currentTime+duration);}
  else{const b=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const source=c.createBufferSource(),filter=c.createBiquadFilter();filter.type='highpass';filter.frequency.value=kind==='hat'?6500:1700;source.buffer=b;source.connect(filter);filter.connect(g);source.start();source.stop(c.currentTime+duration);}
 }
 good(){this.tone(659);setTimeout(()=>this.tone(880),110);}
 speak(text:string,force=false){if((!this.readAloud&&!force)||!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.85;this.duckUntil=Date.now()+Math.max(2000,text.length*70);window.speechSynthesis.speak(u);}
 stopVoice(){if('speechSynthesis' in window)window.speechSynthesis.cancel();}
}
