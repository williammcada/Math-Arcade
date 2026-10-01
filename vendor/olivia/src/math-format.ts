/** Escape first: only generated numeric fraction tokens become markup. */
export function formatMath(text:string):string {
 return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
  .replace(/\b(\d+|x)\/(\d+)\b/g,(_,n,d)=>`<span class="fraction" role="math" aria-label="${n} over ${d}"><span aria-hidden="true" class="numerator">${n}</span><span aria-hidden="true" class="denominator">${d}</span></span>`).replace(/\^(\d+)/g,'<sup>$1</sup>');
}

