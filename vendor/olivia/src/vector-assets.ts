import {beadDesigns,beadSvg} from './beads';
// Phaser's data-URI loader decodes with atob, including for SVG files.
export const svgDataUri=(svg:string)=>'data:image/svg+xml;base64,'+btoa(svg);
export function vectorAssets(){return [
 ...beadDesigns.map((_,i)=>({key:'bead'+i,url:svgDataUri(beadSvg(i)),width:32,height:32}))
];}
