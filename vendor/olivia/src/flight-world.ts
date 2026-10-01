import Phaser from 'phaser';
import {FLIGHT,flightState,advanceFlight,skyObstacles,obstacleY,touchesObstacle,bumpFlight,passesBead,type FlightState} from './flight';
import {beadColors} from './beads';
import {flightSprite,flightTextureAt} from './flight-art';
import type {Level} from './levels';
import type {WorldHooks} from './world';

type Input={up:boolean;down:boolean;jump:boolean;power:boolean;interact:boolean};
/** Flight owns its whole course. It has no midair gate, well or math callback. */
export class FlightRun {
 player!:Phaser.Physics.Arcade.Sprite;state:FlightState;flying=false;done=false;
 private mount!:Phaser.GameObjects.Sprite;private gate!:Phaser.GameObjects.Image;private trail!:Phaser.GameObjects.Graphics;private wrist?:Phaser.GameObjects.Image;
 private obstacles:Phaser.GameObjects.Container[]=[];private beads:{spec:Level['beads'][number];image:Phaser.GameObjects.Image}[]=[];
 private clouds:{image:Phaser.GameObjects.Container;x:number;y:number;speed:number}[]=[];
 private keys?:Record<string,Phaser.Input.Keyboard.Key>;private cursors?:Phaser.Types.Input.Keyboard.CursorKeys;
 private actionWas=false;private lastSave=0;private lastHud='';private message='';private messageUntil=0;
 constructor(private scene:Phaser.Scene,private hooks:WorldHooks,private level:Level,private input:Input){
  const run=hooks.save.data.active!;this.flying=!!run.flight&&run.gateOpen;this.state=flightState(this.flying?run.flight:undefined);
  run.checkpoint=0;run.levelRevision=3;
 }
 create(){
  const s=this.scene,r=this.hooks.save.data.active!,l=this.level;
  s.physics.world.setBounds(0,0,l.width,224);s.cameras.main.setBounds(0,0,l.width,224).setRoundPixels(true);
  for(let i=0;i<11;i++){
   const cloud=s.add.container(0,0).setScrollFactor(0).setDepth(.5),g=s.add.graphics();
   g.fillStyle(i%2?0xfff5f7:0xe5f8ff,.9);g.fillEllipse(0,0,80,20);g.fillEllipse(-20,-7,31,23);g.fillEllipse(9,-11,48,28);cloud.add(g);
   const y=i%3===0?202:i%3===1?29:210;cloud.setPosition(i*83%480-80,y);
   this.clouds.push({image:cloud,x:i*83,y,speed:i%3===1?.18:.48});
  }
  const pad=s.add.graphics().setDepth(2);pad.fillStyle(0xfff9ed);pad.fillRoundedRect(0,181,244,40,16);pad.fillStyle(0xe1cff4);pad.fillRoundedRect(0,196,232,35,14);
  this.gate=s.add.image(l.gate,181,'s14').setOrigin(.5,1).setDisplaySize(52,80).setDepth(3).setAlpha(r.gateOpen?.35:1);
  this.player=s.physics.add.sprite(this.state.x,this.state.y,'fly0').setVisible(false);
  (this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);this.player.setVelocity(0,0);
  this.mount=s.add.sprite(this.state.x,this.state.y,flightTextureAt(0,this.hooks.save.data.settings.reducedMotion)).setOrigin(flightSprite.originX,flightSprite.originY).setDisplaySize(flightSprite.size,flightSprite.size).setDepth(7);
  const worn=this.hooks.save.data.bracelets.find(b=>b.id===this.hooks.save.data.worn);
  if(worn)this.wrist=s.add.image(this.state.x+flightSprite.wristX,this.state.y+flightSprite.wristY,'bead'+worn.beads[0]).setDisplaySize(4,4).setDepth(8);
  this.trail=s.add.graphics().setDepth(5);
  s.cameras.main.startFollow(this.player,true,.2,.2,-80,0);
  for(const spec of l.beads)if(!r.collected.includes(spec.id))this.beads.push({spec,image:s.add.image(spec.x,spec.y,'bead'+spec.color).setDisplaySize(16,16).setDepth(5)});
  for(const o of skyObstacles){
   const container=s.add.container(o.x,o.y).setDepth(4),g=s.add.graphics();container.add(g);
   if(o.kind==='storm'){
    g.fillStyle(0x927eb4);g.lineStyle(2,0x59436e);g.fillEllipse(0,0,68,37);g.strokeEllipse(0,0,68,37);g.fillEllipse(-14,-11,29,26);g.fillEllipse(10,-12,37,29);
    g.fillStyle(0xffe29a);g.fillPoints([{x:-3,y:2},{x:7,y:2},{x:1,y:11},{x:8,y:11},{x:-5,y:25},{x:-1,y:14},{x:-8,y:14}],true);
    g.fillStyle(0x59436e);g.fillCircle(-14,-4,2);g.fillCircle(14,-4,2);
   }else if(o.kind==='balloon'){
    g.lineStyle(1,0x775881);g.lineBetween(0,17,0,34);g.fillStyle(0xf3a0b8);g.fillEllipse(0,-2,48,43);g.lineStyle(2,0x8b607f);g.strokeEllipse(0,-2,48,43);g.fillStyle(0xfff4df);g.fillEllipse(-7,-9,9,15);g.fillStyle(0xf8d688);g.fillTriangle(-5,21,5,21,0,14);g.fillRect(-9,30,18,8);
   }else{
    g.fillStyle(0xf8d078);g.lineStyle(2,0x8a658a);const points=[{x:0,y:-24},{x:22,y:0},{x:0,y:23},{x:-22,y:0}];g.fillPoints(points,true);g.strokePoints(points,true);g.fillStyle(0xec91b8);g.fillTriangle(0,-24,22,0,0,0);g.fillStyle(0x9dcddd);g.fillTriangle(0,0,0,23,-22,0);g.lineStyle(1,0x8a658a);g.lineBetween(0,-24,0,23);g.lineBetween(-22,0,22,0);g.lineBetween(0,23,7,38);g.fillStyle(0xec91b8);g.fillTriangle(0,27,10,29,3,34);
   }
   this.obstacles.push(container);
  }
  const picnic=s.add.graphics().setDepth(3);picnic.fillStyle(0xfffbef);picnic.fillRoundedRect(FLIGHT.finish-180,172,500,70,24);picnic.fillStyle(0xf5abc3);picnic.fillRect(FLIGHT.finish-54,172,110,5);
  s.add.image(FLIGHT.finish+10,172,'s11').setDisplaySize(38,39).setOrigin(.5,1).setDepth(4);
  s.add.text(FLIGHT.finish-10,102,'Poppy’s cloud picnic!',{fontSize:'11px',color:'#59436e',backgroundColor:'#fff4d9',padding:{x:5,y:4}}).setOrigin(.5).setDepth(4);
  if(s.input.keyboard){this.cursors=s.input.keyboard.createCursorKeys();this.keys=s.input.keyboard.addKeys('W,S,Q,E,SPACE,ESC') as Record<string,Phaser.Input.Keyboard.Key>;this.keys.ESC.on('down',()=>this.hooks.pause());}
  this.message=this.flying?'Back in the clouds! ↑ Rise · ↓ Dive':'Open the sky gate. Then take flight!';this.messageUntil=4500;
  s.events.on('resume',()=>{this.lastHud='';this.report();});this.report();
 }
 report(force=false){
  const r=this.hooks.save.data.active!,progress=Math.round((this.state.x-FLIGHT.startX)/(FLIGHT.finish-FLIGHT.startX)*100);
  const context=this.flying?'':r.gateOpen?'Take flight!':'Open sky gate';
  const status={moonSeconds:0,moonHint:'',message:this.state.elapsed<this.messageUntil?this.message:'',ride:true,flight:{progress:Math.max(0,progress),boostReady:this.state.elapsed>=this.state.boostReadyAt,flying:this.flying}};
  const key=JSON.stringify([context,status,r.beads]);if(force||key!==this.lastHud){this.lastHud=key;this.hooks.hud(context,status);}
 }
 update(delta:number){
  if(this.done)return;const r=this.hooks.save.data.active!,s=this.scene,state=this.state;
  const action=!!(this.input.interact||this.keys?.E.isDown),freshAction=action&&!this.actionWas;this.actionWas=action;
  if(!this.flying){
   this.gate.setAlpha(r.gateOpen?.35:1);this.report();
   if(freshAction){if(!r.gateOpen){this.hooks.gate();return;}this.flying=true;r.flight={x:state.x,y:state.y};this.message='↑ Rise · ↓ Dive · ★ Star Dash';this.messageUntil=4000;this.hooks.save.persist();}
   else return;
  }
  const before={x:state.x,y:state.y},boosting=state.elapsed<state.boostUntil;
  advanceFlight(state,{up:!!(this.input.up||this.input.jump||this.cursors?.up.isDown||this.keys?.W.isDown||this.keys?.SPACE.isDown),down:!!(this.input.down||this.cursors?.down.isDown||this.keys?.S.isDown),boost:!!(this.input.power||this.keys?.Q.isDown)},delta);
  if(!boosting&&state.elapsed<state.boostUntil)this.hooks.audio.tone(1047,.16);
  for(let i=0;i<skyObstacles.length;i++){
   const o=skyObstacles[i];this.obstacles[i].y=obstacleY(o,state.elapsed);
   if(touchesObstacle(state,o)&&bumpFlight(state)){this.message='A little bump! Every bead is safe.';this.messageUntil=state.elapsed+1900;this.hooks.audio.tone(196,.1);}
  }
  for(const b of this.beads)if(b.image.active&&passesBead(before,state,b.spec)&&this.hooks.session.collect(b.spec.id)){b.image.destroy();this.hooks.audio.tone(784+b.spec.color%8*48,.08);}
  (this.player.body as Phaser.Physics.Arcade.Body).reset(state.x,state.y);
  const reduced=this.hooks.save.data.settings.reducedMotion;
  this.mount.setPosition(state.x,state.y).setTexture(flightTextureAt(state.elapsed,reduced)).setAngle(reduced?0:state.vy/FLIGHT.climb*7).setAlpha(state.elapsed<state.invulnerableUntil&&Math.floor(state.elapsed/120)%2?.55:1);
  const angle=reduced?0:state.vy/FLIGHT.climb*7*Math.PI/180,{wristX:wx,wristY:wy}=flightSprite;this.wrist?.setPosition(state.x+wx*Math.cos(angle)-wy*Math.sin(angle),state.y+wx*Math.sin(angle)+wy*Math.cos(angle)).setAngle(reduced?0:state.vy/FLIGHT.climb*7).setAlpha(this.mount.alpha);
  for(const cloud of this.clouds)cloud.image.setPosition(((cloud.x-state.x*cloud.speed)%480+480)%480-80,cloud.y);
  this.trail.clear();
  if(!reduced)for(let i=0;i<10;i++){const phase=(state.elapsed/65+i)%10;this.trail.fillStyle(Phaser.Display.Color.HexStringToColor(beadColors[i%6]).color,(1-phase/10)*.55);this.trail.fillCircle(state.x-28-phase*(state.elapsed<state.boostUntil?9:5),state.y+5+Math.sin(phase+state.elapsed/200)*3,2.8-phase*.18);}
  this.gate.setVisible(state.x<420);
  r.flight={x:state.x,y:state.y};
  if(state.elapsed-this.lastSave>=1000){this.lastSave=state.elapsed;this.hooks.save.persist();}
  this.report();
  if(state.x>=FLIGHT.finish){this.done=true;this.hooks.save.persist();this.hooks.audio.good();this.hooks.rescue();}
 }
}
