// Same-origin public entry point. Fixed upstream; never an open proxy.
export const UPSTREAM='https://math-arcade.willmcada-apps.workers.dev';
export async function proxy(request,fetcher=fetch){
 const publicURL=new URL(request.url);
 if(!['GET','HEAD','POST'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(request.method==='POST'&&request.headers.get('origin')!==publicURL.origin)return new Response('Request origin not allowed',{status:403,headers:{'Cache-Control':'no-store'}});
 const url=new URL(UPSTREAM);url.pathname=publicURL.pathname;url.search=publicURL.search;
 const headers=new Headers(request.headers);
 for(const key of ['host','x-forwarded-host','x-forwarded-proto','cf-connecting-ip','x-real-ip'])headers.delete(key);
 if(request.method==='POST')headers.set('origin',url.origin);
 try{
  const response=await fetcher(new Request(url,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,redirect:'manual',duplex:'half'}));
  const result=new Response(response.body,response);
  // Authenticated JSON, protected games and session cookies must never be CDN shared.
  result.headers.set('Cache-Control','private, no-store');
  result.headers.set('Netlify-CDN-Cache-Control','no-store');
  result.headers.set('X-Arcade-Entry','netlify');
  const location=result.headers.get('location');
  if(location){const next=new URL(location,url);if(next.origin!==url.origin)return new Response('Unexpected upstream redirect',{status:502});next.protocol=publicURL.protocol;next.host=publicURL.host;result.headers.set('location',next.href);}
  return result;
 }catch{return new Response('The classroom service could not be reached. Please try again.',{status:503,headers:{'Cache-Control':'no-store'}});}
}
export default request=>proxy(request);
