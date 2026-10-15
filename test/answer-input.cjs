// v0.10.0 (handbook U-18): keypad answer boxes are read-only and filled by the Math Engine answer pad.
// Tests enter answers the way a student with a keyboard does: the physical keys go through the pad.
// The answer is first written with pad keys (− for minus, √ for sqrt, × for *), as a student would type it.
// Text-box questions (words, letters) still accept fill().
// The vendored Engine file is CommonJS inside a "type": "module" package, so it is loaded explicitly.
const fs=require('node:fs'),path=require('node:path');
const padModule={exports:{}};new Function('module','exports',fs.readFileSync(path.join(__dirname,'../vendor/math/answer-pad.js'),'utf8'))(padModule,padModule.exports);
const {padForm}=padModule.exports;
async function enterAnswer(locator,text){
 const page=locator.page();
 if(await locator.evaluate(e=>e.readOnly)){
  await locator.focus();await page.keyboard.press('Escape');await page.keyboard.type(padForm(String(text)));
 }else await locator.fill(String(text));
}
module.exports={enterAnswer};
