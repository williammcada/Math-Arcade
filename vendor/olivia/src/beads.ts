export type BeadPattern='plain'|'stripes'|'dots'|'flower'|'heart'|'star'|'swirl'|'check'|'paw';
export interface BeadDesign {name:string;color:string;accent:string;shape:'round'|'square'|'gem';pattern:BeadPattern}
const colors=['#f27fa6','#67c8f0','#f7c84b','#75d9b5','#a98be8','#f1a85b','#dc74c2','#56b8b3','#ef7775','#a0bbf2','#bfdc71','#efc9e9'];
const names=['Rose','Sky','Sun','Mint','Lilac','Peach','Orchid','Lagoon','Coral','Periwinkle','Lime','Pearl'];
// IDs 0–11 retain the colors and identities of beads in existing saves.
export const beadDesigns:readonly BeadDesign[]=[
 ...colors.map((color,i)=>({name:names[i],color,accent:'#fff4db',shape:(['round','square','gem'] as const)[i%3],pattern:'plain' as const})),
 ...([['Strawberry heart',0,'heart'],['Sky stripes',1,'stripes'],['Sunflower',2,'flower'],['Mint polka dot',3,'dots'],['Moonlight swirl',4,'swirl'],['Peach gingham',5,'check'],['Kitten paws',6,'paw'],['Lagoon star',7,'star'],['Candy stripes',8,'stripes'],['Bluebell blossom',9,'flower'],['Lime gingham',10,'check'],['Pearl hearts',11,'heart'],['Rose polka dot',0,'dots'],['Sky star',1,'star'],['Sunshine swirl',2,'swirl'],['Puppy paws',3,'paw'],['Lilac blossom',4,'flower'],['Peach hearts',5,'heart'],['Orchid gingham',6,'check'],['Lagoon stripes',7,'stripes'],['Coral star',8,'star'],['Periwinkle dots',9,'dots'],['Lime blossom',10,'flower'],['Pearl swirl',11,'swirl']] as [string,number,BeadPattern][]).map(([name,i,pattern],n)=>({name,color:colors[i],accent:n%4===2?'#73558c':'#fff9e4',shape:(['round','gem','round','square'] as const)[n%4],pattern}))
];
export const beadColors=beadDesigns.map(b=>b.color),beadNames=beadDesigns.map(b=>b.name);
export function beadAttributes(id:number){const b=beadDesigns[id];return `data-design="${id}" data-shape="${b.shape}" data-pattern="${b.pattern}" style="--bead:${b.color};--accent:${b.accent}"`;}
/** The exact same artwork appears in the level, inventory, studio and gallery. */
export function beadSvg(id:number){
 const b=beadDesigns[id],base=b.shape==='round'?'<circle cx="16" cy="16" r="14"/>':b.shape==='square'?'<rect x="2" y="2" width="28" height="28" rx="6"/>':'<path d="M10 2H23L30 10V23L22 30H9L2 22V10Z"/>';
 const motifs:Record<BeadPattern,string>={
  plain:'',stripes:'<path d="M7 12L21 5M6 21L26 11M12 27L27 19" fill="none" stroke-width="3"/>',
  dots:[[10,9],[22,9],[8,19],[24,20],[16,25]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4"/>`).join(''),
  flower:'<ellipse cx="16" cy="9" rx="3.3" ry="5"/><ellipse cx="16" cy="23" rx="3.3" ry="5"/><ellipse cx="9" cy="16" rx="5" ry="3.3"/><ellipse cx="23" cy="16" rx="5" ry="3.3"/>',
  heart:'<path d="M16 26C12 22 5 17 5 12C5 6 13 5 16 11C19 5 27 6 27 12C27 17 20 23 16 26Z"/>',
  star:'<path d="M16 4L19 12L28 12L21 18L24 27L16 22L8 27L11 18L4 12L13 12Z"/>',
  swirl:'<path d="M7 19C2 8 22 1 26 13C30 24 13 30 10 21C7 13 20 9 22 17C23 22 17 22 16 18" fill="none" stroke-width="2.7"/>',
  check:'<path d="M6 7H13V14H6ZM20 7H26V14H20ZM13 14H20V21H13ZM6 21H13V26H6ZM20 21H26V26H20Z" stroke="none"/>',
  paw:'<ellipse cx="16" cy="21" rx="7" ry="5"/><ellipse cx="7" cy="13" rx="2.7" ry="3.5"/><ellipse cx="13" cy="8" rx="2.7" ry="3.5"/><ellipse cx="20" cy="8" rx="2.7" ry="3.5"/><ellipse cx="26" cy="14" rx="2.5" ry="3.5"/>'
 };
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true"><g fill="${b.color}" stroke="#59457f" stroke-width="2">${base}</g><g fill="${b.accent}" stroke="${b.accent}" stroke-width=".4">${motifs[b.pattern]}</g><path d="M7 10Q8 6 12 6" fill="none" stroke="white" opacity=".55" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="16" r="2" fill="#71536b"/></svg>`;
}
export const beadDecoration=beadSvg;
