// SQLite-backed Durable Object. Chunking keeps campaign saves below SQL row limits.
// No await is allowed inside tx: read, authorization and write are one transaction.
export class DurableStore {
 constructor(storage){
  this.storage=storage;this.sql=storage.sql;
  this.sql.exec('CREATE TABLE IF NOT EXISTS workspace_chunks (id INTEGER PRIMARY KEY, value TEXT NOT NULL)');
  if(!this.sql.exec('SELECT id FROM workspace_chunks LIMIT 1').toArray().length)
   this.sql.exec('INSERT INTO workspace_chunks VALUES (0, ?)',JSON.stringify({version:1,classes:[],tokens:[],revision:0}));
 }
 tx(fn){return this.storage.transactionSync(()=>{
  const before=this.sql.exec('SELECT value FROM workspace_chunks ORDER BY id').toArray().map(r=>r.value);
  const state=JSON.parse(before.join('')),result=fn(state);
  if(result&&typeof result.then==='function')throw Error('Transactions must be synchronous.');
  const text=JSON.stringify(state),chunks=[];
  for(let at=0;at<text.length;){let end=Math.min(at+32768,text.length);const last=text.charCodeAt(end-1);if(last>=0xD800&&last<=0xDBFF)end--;chunks.push(text.slice(at,end));at=end;}
  for(let i=0;i<chunks.length;i++)if(chunks[i]!==before[i])this.sql.exec('INSERT INTO workspace_chunks VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET value=excluded.value',i,chunks[i]);
  if(before.length>chunks.length)this.sql.exec('DELETE FROM workspace_chunks WHERE id>=?',chunks.length);
  return result;
 });}
}
