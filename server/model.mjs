import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {Model as CoreModel} from './core-model.mjs';
export {VERSION,games} from './core-model.mjs';
export class SqliteStore {
 constructor(path){
  mkdirSync(dirname(path),{recursive:true});this.db=new DatabaseSync(path);
  this.db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS workspace (id INTEGER PRIMARY KEY, value TEXT NOT NULL)');
  this.db.prepare('INSERT OR IGNORE INTO workspace VALUES (1, ?)').run(JSON.stringify({version:1,classes:[],tokens:[],revision:0}));
 }
 tx(fn){this.db.exec('BEGIN IMMEDIATE');try{const s=JSON.parse(this.db.prepare('SELECT value FROM workspace WHERE id=1').get().value);const value=fn(s);this.db.prepare('UPDATE workspace SET value=? WHERE id=1').run(JSON.stringify(s));this.db.exec('COMMIT');return value;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 close(){this.db.close();}
}
// Local development and legacy database compatibility. Production uses DurableStore.
export class Model extends CoreModel {
 constructor(path,password,options){super(new SqliteStore(path),password,options);}
}
