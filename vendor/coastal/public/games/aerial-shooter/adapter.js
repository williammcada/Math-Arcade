import * as core from './core.js';
import {loadArt,render} from './render.js';
import {RESULT_LABELS,BUILD_VERSION,T} from './tuning.js';
import {MIDPOINT_SECONDS} from './level.js';
const audio=new URL('../../assets/aerial-shooter/audio/',import.meta.url);
export const aerialAdapter={
  id:'aerial-shooter',title:'Coastal Escape',buildVersion:BUILD_VERSION,durationSeconds:T.limit/T.hz,dimensions:[640,360],inputStyle:'directional',utilityButtons:['pause','sound','help','assist','reset'],
  instructions:'Fly north, dodge incoming fire, and defeat the heavy bomber. Firing is automatic. Three lives share one five-minute active clock.',
  help:'Slide your thumb across the D-pad, including its corners, to move in any direction. On a keyboard use arrows or W A S D; Escape pauses. Shoot the yellow carriers, then fly through their supply. S = spread, R = rapid fire, W = wingman, + = repair. At the boss, destroy both outer wing guns before attacking the center.',
  resultLabels:RESULT_LABELS,create:core.createRun,restore:core.restore,snapshot:core.snapshot,step:core.step,enterAssisted:core.enterAssisted,chooseAssisted:core.chooseAssisted,loadArt,render,
  media:{ambient:new URL('flight.mp3',audio).href,danger:new URL('boss.mp3',audio).href,ending:new URL('victory.wav',audio).href,effects:new URL('effects.wav',audio).href,sfx:Object.fromEntries(['shot','upgraded','rapid','enemy','heavy','hurt','explosion','repair','bonus','checkpoint','warning','carrier','expose','victory','escape','defeat','engine'].map(id=>[id,new URL(id+'.wav',audio).href]))},
  music:s=>s.boss?'danger':'ambient',
  objective:s=>s.boss?(s.boss.phase==='core'?'Target the exposed center':'Destroy both outer wing guns'):s.levelTick<MIDPOINT_SECONDS*T.hz?'Reach the coastal harbor':'Clear the harbor and intercept the bomber',
  assisted:[
    {title:'Choose a safe route',description:'The turret covers the middle and right lanes. Which route is outside its marked firing lane?',choices:['Left route — outside the marked area','Middle route — inside the marked area','Right route — inside the marked area'],feedback:'The left route stays outside the turret’s marked firing lane.',figure:'route'},
    {title:'Find the gap',description:'A bomber fires two groups of shots. The marked center gap is clear. Where can you move?',choices:['Left — into the incoming shots','Center — through the clear gap','Right — into the incoming shots'],feedback:'Move through the clear center gap between the two groups of shots.',figure:'gap'},
    {title:'Choose the exposed target',description:'Both outer wing guns are exposed. The center still has armor. What should you attack first?',choices:['An outer wing gun','The protected center','A propeller engine'],feedback:'Destroy the two wing guns first. Then the center becomes vulnerable.',figure:'boss'}
  ]
};
