import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
// pad.js imports browser modules by absolute URL; test the pure geometry by evaluating its source function.
const src=readFileSync(new URL('../public/pad.js',import.meta.url),'utf8');
const body=src.slice(src.indexOf('export function padDirection'),src.indexOf('export function padMarkup')).replace('export ','');
const padDirection=new Function(body+';return padDirection;')();
const at=(mode,col,row)=>Object.keys(padDirection(mode,(col+.5)*52,(row+.5)*52,156,156)).sort().join('+');
test('U-17 8-direction pad: every one of the 3×3 cells is a direction (no empty cells)',()=>{assert.deepEqual([[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2]].map(([c,r])=>at('eight',c,r)),['left+up','up','right+up','left','right','down+left','down','down+right']);assert.equal(Object.keys(padDirection('eight',70,78,156,156)).join(),'left');assert.equal(Object.keys(padDirection('eight',80,78,156,156)).join(),'right');});
test('U-17 cross pad: four directions, never a diagonal; corners go to the nearer arm',()=>{for(const [c,r,want] of [[1,0,'up'],[0,1,'left'],[2,1,'right'],[1,2,'down']])assert.equal(at('cross',c,r),want);for(const c of [0,2])for(const r of [0,2])assert.equal(at('cross',c,r).split('+').length,1);});
test('U-10 slide off the pad releases the direction',()=>{assert.deepEqual(padDirection('eight',-60,78,156,156),{});assert.deepEqual(padDirection('cross',78,300,156,156),{});assert.equal(at('eight',0,0),'left+up');});
test('U-17: no game host still renders a row of arrow buttons',()=>{const css=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');assert.ok(css.includes('.ap-pad'));for(const [f,mode] of [['nightfall',"pad:'cross'"],['ironbreak',"pad:'eight'"],['flight',"pad:'eight'"],['extra-games',"journey:'eight'"]])assert.ok(readFileSync(new URL('../public/'+f+'.js',import.meta.url),'utf8').includes(mode),f);});
