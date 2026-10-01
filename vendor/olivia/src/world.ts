import Phaser from 'phaser';
import {vectorAssets} from './vector-assets';
import {flightTextures} from './flight-art';
import {FlightRun} from './flight-world';
import {beadColors,quests,type SaveService,type SessionService} from './core';
import {levels,MOTION,moonTarget,type Level,type Ledge,type Enemy} from './levels';
import type {AudioService} from './audio';
export function asset(name:string){return (window as unknown as {__OLIVIA_ASSETS__?:Record<string,string>}).__OLIVIA_ASSETS__?.[name]||'./art/'+name;}
export const controls={left:false,right:false,up:false,down:false,jump:false,interact:false,power:false,moon:false};
export function clearControls(){window.dispatchEvent(new Event('olivia-input-reset'));Object.keys(controls).forEach(k=>controls[k as keyof typeof controls]=false);}
export interface WorldStatus {moonSeconds:number;moonHint:string;message:string;ride:boolean;flight?:{progress:number;boostReady:boolean;flying:boolean}}
export interface WorldHooks {save:SaveService;session:SessionService;audio:AudioService;gate:()=>void;refill:()=>void;rescue:()=>void;pause:()=>void;hud:(context:string,status?:WorldStatus)=>void;ready:()=>void;screen:(name:string)=>void;}
let hooks:WorldHooks;
export function setHooks(h:WorldHooks){hooks=h;}
export class BootScene extends Phaser.Scene {constructor(){super('BootScene');}create(){this.scene.start('PreloadScene');}}
export class PreloadScene extends Phaser.Scene {
 constructor(){super('PreloadScene');}
 preload(){this.cameras.main.setBackgroundColor('#59457f');const text=this.add.text(160,112,'Gathering the sparkle…',{fontFamily:'sans-serif',fontSize:'13px',color:'#fff4d9'}).setOrigin(.5);for(let i=0;i<16;i++)this.load.image('s'+i,asset('sprite-'+i+'.png'));for(const q of quests)if(q.portrait)this.load.image('friend-'+q.id,asset(q.portrait));for(const t of flightTextures)this.load.image(t.key,asset(t.file));for(const v of vectorAssets())this.load.svg(v.key,v.url,{width:v.width,height:v.height});this.load.on('progress',(p:number)=>text.setText('Gathering the sparkle… '+Math.round(p*100)+'%'));}
 create(){hooks.ready();}
}
export function screenScene(key:string){return class extends Phaser.Scene {constructor(){super(key);}create(){drawSky(this);hooks.screen(key);}};}
export function drawSky(s:Phaser.Scene,theme:Level['theme']='meadow'){
 const g=s.add.graphics().setScrollFactor(0),c={meadow:[0x81d5f1,0xb8e7f3,0xa2ce9c],forest:[0x315c64,0x79ada3,0x326c59],cave:[0x292448,0x51436e,0x735783],sky:[0x71cef0,0xb5e9f7,0xf4d8ec],desert:[0xf7bd68,0xffdf9a,0xde9d55],ice:[0x8bd8ef,0xdaf7ff,0x9fcce6]}[theme];
 g.fillStyle(c[0]);g.fillRect(0,0,320,224);g.fillStyle(c[1]);g.fillRect(0,110,320,114);
 if(theme==='meadow'){
  [0xef97b4,0xf3c470,0xefe68c,0xa4ddb1,0x92bcee,0xc0a2e6].forEach((color,i)=>{g.lineStyle(6,color,.7);g.beginPath();g.arc(168,205,145-i*6,Math.PI,Math.PI*2);g.strokePath();});
  g.fillStyle(0xfff4e8);[[28,45],[245,67],[134,31]].forEach(([x,y])=>{g.fillRoundedRect(x,y,49,12,5);g.fillRoundedRect(x+10,y-7,21,17,5);});
 }
 if(theme==='meadow'){g.fillStyle(c[2]);g.fillEllipse(30,250,280,150);g.fillEllipse(280,240,230,120);}
 if(theme==='forest'){for(let i=0;i<7;i++){g.fillStyle(i%2?0x285b50:0x417966);g.fillRect(i*58-5,38,13,170);g.fillEllipse(i*58,45,110,85);}g.fillStyle(0x99c785,.5);g.fillEllipse(240,140,90,140);}
 if(theme==='cave'){for(let i=0;i<12;i++){g.fillStyle(i%2?0x352b51:0x40335f);g.fillTriangle(i*30,0,i*30+25,0,i*30+12,28+(i%4)*10);}for(let i=0;i<19;i++){g.fillStyle(i%2?0xb7b6ff:0x91e4ec,.6);g.fillCircle((i*67)%320,32+(i*29)%144,1);}}
 if(theme==='desert'){g.fillStyle(0xffedb8,.55);g.fillCircle(257,37,23);for(let i=0;i<4;i++){g.fillStyle(i%2?0xe8a557:0xf1bc68);g.fillEllipse(i*115+30,215,185,80);}}
 if(theme==='ice'){g.fillStyle(0xf9ffff,.9);g.fillCircle(252,38,22);for(let i=0;i<9;i++){g.fillStyle(i%2?0xdff8ff:0xf8ffff,.7);g.fillTriangle(i*42,110,i*42+40,110,i*42+20,66+(i%3)*8);}}
}
type Moving={slab:Phaser.GameObjects.Rectangle;body:Phaser.Physics.Arcade.Body;spec:Ledge};
type Falling={slab:Phaser.GameObjects.Rectangle;body:Phaser.Physics.Arcade.Body;spec:Ledge;armedAt:number;falling:boolean};
type Mob={image:Phaser.GameObjects.Image;wings?:Phaser.GameObjects.Graphics;spec:Enemy};
type BeadObject={id:number;x:number;y:number;hidden:boolean;image:Phaser.GameObjects.Image;halo:Phaser.GameObjects.Arc;marker?:Phaser.GameObjects.Text};
export class PlatformScene extends Phaser.Scene {
 flight?:FlightRun;
 player!:Phaser.Physics.Arcade.Sprite;level!:Level;companion?:Phaser.GameObjects.Image;wristBead?:Phaser.GameObjects.Arc;
 gateImage!:Phaser.GameObjects.Image;moonWash!:Phaser.GameObjects.Rectangle;moonRing!:Phaser.GameObjects.Arc;
 beads:BeadObject[]=[];mobs:Mob[]=[];moving:Moving[]=[];falling:Falling[]=[];
 cursors?:Phaser.Types.Input.Keyboard.CursorKeys;keys?:Record<string,Phaser.Input.Keyboard.Key>;
 lastGround=-10000;jumpBuffer=0;jumpWas=false;actionWas=false;powerWas=false;moonWas=false;invulnerable=0;moonUntil=0;context='';lastAnim='';elapsed=0;lastHud='';message='';messageUntil=0;springUntil=0;
 status:WorldStatus={moonSeconds:0,moonHint:'Reveal secret beads',message:'',ride:false};
 constructor(){super('PlatformScene');}
 create(){
  clearControls();this.flight=undefined;this.beads=[];this.mobs=[];this.moving=[];this.falling=[];this.companion=undefined;this.wristBead=undefined;
  this.jumpWas=this.actionWas=this.powerWas=this.moonWas=false;this.lastGround=-10000;this.jumpBuffer=0;this.invulnerable=this.moonUntil=this.elapsed=this.springUntil=0;this.lastHud=this.context=this.lastAnim='';
  const r=hooks.save.data.active!;this.level=levels[r.quest];const l=this.level;
  drawSky(this,l.theme);hooks.audio.setTheme?.(r.quest);
  if(l.ride){this.flight=new FlightRun(this,hooks,l,controls);this.flight.create();this.player=this.flight.player;this.events.once('shutdown',clearControls);return;}
  this.physics.world.setBounds(0,-30,l.width,390);this.cameras.main.setBounds(0,0,l.width,224).setRoundPixels(true);
  const ground=this.physics.add.staticGroup(),scenery=this.add.graphics();
  const floor=l.theme==='forest'?0x61482e:l.theme==='cave'?0x665078:l.theme==='desert'?0xc98242:l.theme==='ice'?0x79b8d1:l.theme==='sky'?0xe9e2ff:0xa78c58;
  const top=l.theme==='forest'?0x7ca95a:l.theme==='cave'?0xab9ed2:l.theme==='desert'?0xf3c56e:l.theme==='ice'?0xeafdff:l.theme==='sky'?0xffffff:0x91c771;
  const spans:[number,number][]=[];let from=0;for(const [start,end] of l.gaps){spans.push([from,start]);from=end;}spans.push([from,l.width]);
  for(const [a,b] of spans){scenery.fillStyle(floor);scenery.fillRect(a,194,b-a,40);scenery.fillStyle(top);scenery.fillRoundedRect(a,192,b-a,8,3);const slab=this.add.rectangle((a+b)/2,218,b-a,48,0xffffff,0);ground.add(slab);}
  for(const [a,b] of l.gaps){if(l.theme==='meadow'){scenery.fillStyle(0x55bedd);scenery.fillRect(a,215,b-a,20);scenery.lineStyle(2,0xd5fbff);scenery.lineBetween(a+4,219,b-4,219);}else if(l.theme==='cave'){scenery.fillStyle(0x201934);scenery.fillRect(a,205,b-a,40);}else if(l.theme==='desert'){scenery.fillStyle(0xe6a053);scenery.fillRect(a,205,b-a,40);}else if(l.theme==='ice'){scenery.fillStyle(0x5daecb);scenery.fillRect(a,205,b-a,40);}this.add.text(a-19,184,'↗',{fontFamily:'sans-serif',fontSize:'12px',color:'#fff0a8',backgroundColor:'#665078'}).setOrigin(.5,1);}
  for(let x=75;x<l.width;x+=143){
   if(l.gaps.some(([a,b])=>x>a-15&&x<b+15))continue;
   if(l.theme==='meadow')this.add.image(x,194,'s13').setOrigin(.5,1).setDisplaySize(13,20);
   if(l.theme==='forest'){scenery.fillStyle(0x4a6650);scenery.fillRect(x,30,12,161);scenery.fillStyle(0x477553);scenery.fillEllipse(x+5,37,80,49);}
   if(l.theme==='cave'){scenery.fillStyle(x%2?0x8d83c8:0x80cbd0);scenery.fillTriangle(x,194,x+18,194,x+9,167);}
   if(l.theme==='desert'){scenery.fillStyle(0x7b9a58);scenery.fillRect(x,163,4,29);scenery.fillEllipse(x-3,165,18,10);scenery.fillEllipse(x+6,154,14,16);}
   if(l.theme==='ice'){scenery.fillStyle(0xeefdff,.8);scenery.fillTriangle(x,192,x+13,192,x+7,169);}
  }
  const optional=this.physics.add.group({allowGravity:false,immovable:true});
  for(const spec of l.ledges){
   const slab=this.add.rectangle(spec.x+spec.w/2,spec.y+5,spec.w,10,top).setStrokeStyle(2,l.theme==='cave'?0x574265:0x55745d).setDepth(2);
   if(spec.move||spec.fall){optional.add(slab);const body=slab.body as Phaser.Physics.Arcade.Body;body.setAllowGravity(false).setImmovable(true);if(spec.move)this.moving.push({slab,body,spec});if(spec.fall){this.falling.push({slab,body,spec,armedAt:0,falling:false});if(l.theme==='desert')slab.setStrokeStyle(2,0x9e653a);if(l.theme==='ice')slab.setStrokeStyle(2,0x72a9c3);}}else ground.add(slab);
   const body=slab.body as Phaser.Physics.Arcade.Body;body.checkCollision.down=false;body.checkCollision.left=false;body.checkCollision.right=false;
  }
  const spawn=l.checkpoints[Math.min(r.checkpoint,l.checkpoints.length-1)];
  this.player=this.physics.add.sprite(spawn,158,'s0').setDisplaySize(30,36).setCollideWorldBounds(true).setDepth(6);
  const body=this.player.body as Phaser.Physics.Arcade.Body;body.setSize(32,50).setOffset(16,12);
  this.player.setDragX(900).setMaxVelocity(MOTION.walk,340);
  this.physics.add.collider(this.player,ground);this.physics.add.collider(this.player,optional);
  if(!this.anims.exists('run'))this.anims.create({key:'run',frames:[{key:'s1'},{key:'s2'},{key:'s1'},{key:'s0'}],frameRate:9,repeat:-1});
  this.cameras.main.startFollow(this.player,true,.16,.16,-35,0);
  if(l.theme!=='cave')this.companion=this.add.image(spawn-26,134,'s7').setDisplaySize(23,25).setDepth(4);
  const worn=hooks.save.data.bracelets.find(b=>b.id===hooks.save.data.worn);
  if(worn)this.wristBead=this.add.circle(spawn+8,163,2,Phaser.Display.Color.HexStringToColor(beadColors[worn.beads[0]]).color).setStrokeStyle(1,0xfff4d9).setDepth(8);
  this.gateImage=this.add.image(l.gate,194,'s14').setOrigin(.5,1).setDisplaySize(48,67).setAlpha(r.gateOpen?.38:1);
  l.wells.forEach(x=>this.add.image(x,194,'s15').setOrigin(.5,1).setDisplaySize(32,36));
  l.checkpoints.slice(1).forEach(x=>{this.add.rectangle(x,180,2,28,0xfff4d9);this.add.triangle(x+5,168,0,0,12,5,0,10,0xf7c84b);});
  l.springs.forEach(x=>{this.add.rectangle(x,187,12,12,0xffecd0);this.add.ellipse(x,181,28,12,0xf7c84b).setStrokeStyle(2,0x8d652c);this.add.text(x,162,'↑',{fontSize:'12px',color:'#fff6cd'}).setOrigin(.5);});
  this.add.image(l.rescue,194,quests[r.quest].portrait?'friend-'+r.quest:'s'+quests[r.quest].sprite).setOrigin(.5,1).setDisplaySize(40,42);
  this.add.text(l.rescue,134,'Help '+quests[r.quest].animal,{fontFamily:'sans-serif',fontSize:'10px',color:'#59457f',backgroundColor:'#fff4d9',padding:{x:4,y:3}}).setOrigin(.5);
  for(const b of l.beads){
   if(r.collected.includes(b.id))continue;
   const color=Phaser.Display.Color.HexStringToColor(beadColors[b.color]).color;
   const halo=this.add.circle(b.x,b.y,9,0xffffe1,.18).setStrokeStyle(2,0xf9f2bf).setDepth(4).setVisible(false);
   const image=this.add.image(b.x,b.y,'bead'+b.color).setDisplaySize(15,15).setDepth(5).setVisible(!b.hidden);
   const marker=b.hidden?this.add.text(b.x,b.y-9,'☾',{fontFamily:'sans-serif',fontSize:'15px',color:'#ece5ff'}).setOrigin(.5).setAlpha(.55).setDepth(3):undefined;
   this.beads.push({...b,image,halo,marker});
  }
  for(const spec of l.enemies){const image=this.add.image(spec.x,spec.y,'s10').setDisplaySize(spec.kind==='cloud'?42:36,spec.kind==='cloud'?32:36).setDepth(5);if(spec.kind==='hopper')image.setTint(0xb2e696);if(spec.kind==='bat')image.setTint(0xd3acf3);if(spec.kind==='cloud')image.setTint(0xffe9f7);const wings=spec.kind==='bat'?this.add.graphics().setDepth(4):undefined;this.mobs.push({image,wings,spec});}
  this.moonWash=this.add.rectangle(160,112,320,224,0xccecff,.13).setScrollFactor(0).setDepth(3).setVisible(false);
  this.moonRing=this.add.circle(spawn,158,50,0xeeeaff,0).setStrokeStyle(2,0xecf5ff,.6).setDepth(4).setVisible(false);
  if(this.input.keyboard){this.cursors=this.input.keyboard.createCursorKeys();this.keys=this.input.keyboard.addKeys('A,D,E,SPACE,ESC,Q,W') as Record<string,Phaser.Input.Keyboard.Key>;this.keys.ESC.on('down',()=>hooks.pause());}
  this.message='Moon symbols hide beads. Tap ☾ to reveal them.';this.messageUntil=6500;
  this.report();this.events.once('shutdown',clearControls);this.events.on('resume',()=>{clearControls();this.lastHud='';this.report();});
 }
 report(){
  const r=hooks.save.data.active!,target=moonTarget(this.level,r.collected,this.player.x),seconds=Math.max(0,Math.ceil((this.moonUntil-this.elapsed)/1000));
  this.status={moonSeconds:seconds,moonHint:target?(seconds?(target.x<this.player.x?'← Secret beads':'Secret beads →'):Math.abs(target.x-this.player.x)<190?'☾ Secret nearby!':'☾ Reveal secret beads'):'All secret beads found!',message:this.elapsed<this.messageUntil?this.message:'',ride:this.level.ride};
  const key=JSON.stringify([this.context,this.status,r.energy,r.beads]);if(key!==this.lastHud){this.lastHud=key;hooks.hud(this.context,this.status);}
 }
 say(text:string){this.message=text;this.messageUntil=this.elapsed+3500;this.report();}
 update(_time:number,delta:number){
  if(!this.player||!this.scene.isActive())return;
  if(this.flight){this.flight.update(delta);return;}
  this.elapsed+=Math.min(delta,50);const time=this.elapsed,r=hooks.save.data.active!,l=this.level,body=this.player.body as Phaser.Physics.Arcade.Body;
  const left=controls.left||this.cursors?.left.isDown||this.keys?.A.isDown,right=controls.right||this.cursors?.right.isDown||this.keys?.D.isDown;
  const jump=!!(controls.jump||this.cursors?.up.isDown||this.keys?.SPACE.isDown),action=!!(controls.interact||this.keys?.E.isDown),power=!!(controls.power||this.keys?.Q.isDown),moon=!!(controls.moon||this.keys?.W.isDown);
  for(const m of this.moving){const move=m.spec.move!,t=time/move.period*Math.PI*2;const target=(move.axis==='x'?m.spec.x+m.spec.w/2:m.spec.y+5)+Math.sin(t)*move.range;const velocity=Phaser.Math.Clamp((target-(move.axis==='x'?m.slab.x:m.slab.y))/Math.max(.01,delta/1000),-75,75);move.axis==='x'?m.body.setVelocityX(velocity):m.body.setVelocityY(velocity);}
  for(const f of this.falling){const fall=f.spec.fall!;const standing=body.blocked.down&&Math.abs(body.bottom-f.slab.y+5)<10&&body.right>f.slab.x-f.spec.w/2+5&&body.left<f.slab.x+f.spec.w/2-5;if(standing&&!f.armedAt&&!f.falling){f.armedAt=time;this.say(l.theme==='ice'?'The snow shelf is cracking!':'The sandstone is crumbling!');}if(f.armedAt&&!f.falling&&time-f.armedAt>=fall.delay){f.falling=true;f.body.setVelocityY(150);f.slab.setFillStyle(l.theme==='ice'?0xb5e9f7:0xd78b45);}if(f.falling&&f.slab.y>300){f.falling=false;f.armedAt=0;f.slab.setPosition(f.spec.x+f.spec.w/2,f.spec.y+5).setFillStyle(l.theme==='ice'?0xeafdff:0xf3c56e);f.body.reset(f.slab.x,f.slab.y);}}
  const grounded=body.blocked.down||body.touching.down;if(grounded)this.lastGround=time;
  if(jump&&!this.jumpWas)this.jumpBuffer=time+120;
  if(this.jumpBuffer>time&&time-this.lastGround<110){this.player.setVelocityY(-(MOTION.jump));this.jumpBuffer=0;this.lastGround=-10000;hooks.audio.tone(440,.08);}
  if(!jump&&this.jumpWas&&body.velocity.y< -90)this.player.setVelocityY(body.velocity.y*.55);this.jumpWas=jump;
  if(time>this.invulnerable-650)this.player.setAccelerationX(left?-900:right?900:0).setMaxVelocity(MOTION.walk,340);
  if(left||right)this.player.setFlipX(!!left);
  if(power&&!this.powerWas){if(r.energy>0){r.energy--;this.player.setVelocityY(-270);hooks.save.persist();hooks.audio.tone(880,.18);}else this.say('No sparkle? Walking and jumping are still free. Visit a well.');}this.powerWas=power;
  if(moon&&!this.moonWas){const target=moonTarget(l,r.collected,this.player.x);if(!target)this.say('You found every secret bead in this level!');else if(time<this.moonUntil)this.say('Moon Sight is already shining!');else if(r.energy>0){r.energy--;this.moonUntil=time+8000;hooks.save.persist();this.say('Moon Sight! Follow the glowing beads and arrow.');hooks.audio.tone(1047,.25);}else this.say('Moon Sight needs 1 sparkle. Visit a sparkle well.');}this.moonWas=moon;
  const active=time<this.moonUntil;this.moonWash.setVisible(active);this.moonRing.setVisible(active).setPosition(this.player.x,this.player.y);this.moonRing.setScale(hooks.save.data.settings.reducedMotion?1:1+Math.sin(time/180)*.15);
  if(!l.ride){const desired=Math.abs(body.velocity.y)>20?'jump':Math.abs(body.velocity.x)>5?'run':'idle';if(this.lastAnim!==desired){this.lastAnim=desired;if(desired==='run')this.player.play('run');else{this.player.anims.stop();this.player.setTexture(desired==='jump'?'s3':'s0');}}}
  const alpha=time<this.invulnerable?(Math.floor(time/100)%2?.45:1):1;this.player.setAlpha(alpha);
  this.wristBead?.setPosition(this.player.x+(this.player.flipX?-7:7),this.player.y+5).setAlpha(alpha);
  if(this.companion){this.companion.x+=(this.player.x-27-this.companion.x)*Math.min(1,delta*.005);this.companion.y=this.player.y-25+(hooks.save.data.settings.reducedMotion?0:Math.sin(time/500)*3);}
  for(const bead of this.beads){if(!bead.image.active)continue;bead.image.setVisible(!bead.hidden||active);bead.halo.setVisible(bead.hidden&&active);bead.marker?.setVisible(!active);if(bead.image.visible&&Phaser.Math.Distance.Between(this.player.x,this.player.y,bead.x,bead.y)<23&&hooks.session.collect(bead.id)){bead.image.destroy();bead.halo.destroy();bead.marker?.destroy();hooks.audio.tone(880+bead.id%12*45,.1);}}
  for(const mob of this.mobs){
   const {image,spec,wings}=mob;if(!image.active)continue;image.x=spec.x+Math.sin(time/(spec.kind==='bat'?650:900))*spec.range;image.y=spec.y-(spec.kind==='hopper'?Math.abs(Math.sin(time/580))*30:spec.kind==='bat'?Math.sin(time/450)*16:spec.kind==='cloud'?Math.sin(time/600)*5:0);
   if(wings){wings.clear().fillStyle(0x9678c1);const y=image.y-5+Math.sin(time/90)*5;wings.fillTriangle(image.x-9,image.y,image.x-28,y,image.x-13,image.y+8);wings.fillTriangle(image.x+9,image.y,image.x+28,y,image.x+13,image.y+8);}
   const top=image.y-12,half=spec.kind==='cloud'?19:15;
   if(body.right>image.x-half&&body.left<image.x+half&&body.bottom>top&&body.top<image.y+13){if(body.velocity.y>5&&this.player.y<image.y-2){image.destroy();wings?.destroy();this.player.setVelocityY(-150);hooks.audio.tone(260,.12);}else if(time>this.invulnerable){this.invulnerable=time+1100;this.player.setVelocity(this.player.x<image.x?-85:85,-90);this.say('A little bump! Your beads are safe.');}}
  }
  if(time>this.springUntil&&body.velocity.y>=0&&l.springs.some(x=>Math.abs(this.player.x-x)<18&&body.bottom>174&&body.bottom<201)){this.springUntil=time+650;this.player.setVelocityY(-285);hooks.audio.tone(740,.14);}
  if(!r.gateOpen&&this.player.x>l.gate-22){const vy=body.velocity.y;body.reset(l.gate-22,this.player.y);this.player.setVelocity(0,vy);}this.gateImage.setAlpha(r.gateOpen?.38:1);
  if(this.player.y>255){clearControls();this.input.keyboard?.resetKeys();body.reset(l.checkpoints[r.checkpoint]||l.checkpoints[0],154);this.player.setVelocity(0,0);this.invulnerable=time+1300;this.lastGround=-10000;this.jumpBuffer=0;this.say('Back on the path. You kept every bead!');}
  if(grounded&&this.player.y<204){let checkpoint=r.checkpoint;l.checkpoints.forEach((x,i)=>{if(this.player.x>=x&&i>checkpoint)checkpoint=i;});if(checkpoint!==r.checkpoint){r.checkpoint=checkpoint;hooks.save.persist();}}
  const nearGate=!r.gateOpen&&Math.abs(this.player.x-(l.gate-24))<46,nearWell=l.wells.some(x=>Math.abs(this.player.x-x)<38),nearAnimal=this.player.x>l.rescue-48&&r.gateOpen;
  this.context=nearGate?'Open rainbow gate':nearWell?'Fill sparkle energy':nearAnimal?'Help '+quests[r.quest].animal:'';this.report();
  if(action&&!this.actionWas){if(nearGate)hooks.gate();else if(nearWell)hooks.refill();else if(nearAnimal){hooks.audio.good();hooks.rescue();}}this.actionWas=action;
 }
}
export const screenNames=['TitleScene','WorldMapScene','MathStationScene','MathOverlayScene','BraceletStudioScene','QuestResultScene','ParentDashboardScene'];

