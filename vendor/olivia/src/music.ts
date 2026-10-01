export const SKY_BPM=156;
export const musicStepMs=(theme:number)=>theme===3?60000/SKY_BPM/4:260;
const melody=[
 [72,76,79,81,79,76,74,76],[79,81,83,86,84,83,79,0],
 [81,84,88,86,84,81,79,81],[77,81,84,88,86,84,81,79],
 [72,76,79,84,83,79,76,79],[74,79,83,86,88,86,83,79],
 [81,84,88,91,88,86,84,81],[77,81,84,86,84,81,79,76],
 [76,79,84,88,86,84,79,76],[74,79,83,86,84,83,81,79],
 [72,76,81,84,83,81,76,72],[72,77,81,84,86,84,81,79],
 [72,76,79,81,84,83,79,76],[74,79,83,86,88,86,83,79],
 [81,84,88,86,84,81,79,76],[77,81,79,76,74,76,72,0]
].flat();
const chords=[[48,52,55],[43,47,50],[45,48,52],[41,45,48]];
const frequency=(midi:number)=>440*2**((midi-69)/12);
export interface MusicNote {frequency:number;duration:number;volume:number;wave:OscillatorType}
/** A 16-bar major-key flight tune: lead, arpeggios, bass and a drum groove. */
export function skyBeat(beat:number){
 const step=beat%256,bar=Math.floor(step/16),chord=chords[bar%4],notes:MusicNote[]=[];
 if(step%2===0){const pitch=melody[step/2];if(pitch)notes.push({frequency:frequency(pitch),duration:.17,volume:.86,wave:'triangle'});}
 if(step%2===1)notes.push({frequency:frequency(chord[Math.floor(step/2)%3]+24),duration:.065,volume:.20,wave:'square'});
 if(step%4===0)notes.push({frequency:frequency(chord[step%8===0?0:2]),duration:.20,volume:.85,wave:'triangle'});
 return {notes,kick:step%8===0,snare:step%8===4,hat:step%2===0};
}
