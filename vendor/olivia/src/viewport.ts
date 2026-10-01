/** Keep the app inside Safari's visible area as toolbars and keyboards change. */
export function installViewport(onResize:()=>void=()=>{}) {
 const viewport=window.visualViewport;
 let queued=false;
 const update=()=>{
  queued=false;
  // Preserve intentional pinch zoom; do not resize the layout to chase it.
  if(viewport&&Math.abs(viewport.scale-1)>.01)return;
  document.documentElement.style.setProperty('--viewport-height',`${Math.round(viewport?.height||window.innerHeight)}px`);
  document.documentElement.style.setProperty('--viewport-width',`${Math.round(viewport?.width||window.innerWidth)}px`);
  onResize();
 };
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
 update();
 window.addEventListener('resize',schedule);
 viewport?.addEventListener('resize',schedule);
 return ()=>{window.removeEventListener('resize',schedule);viewport?.removeEventListener('resize',schedule);};
}
