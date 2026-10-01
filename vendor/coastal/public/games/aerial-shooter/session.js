// Transport contract for the future classroom adapter; practice never imports this.
// A durable terminal command has its own slot and cannot be replaced by progress.
export class FlightSession {
 constructor({run,send,save,onReconcile,now=()=>Date.now()}){this.run=run;this.send=send;this.save=save;this.onReconcile=onReconcile;this.now=now;this.seq=run.seq;this.lastContact=now();this.progress=null;this.terminal=null;this.sending=false;this.resumeRequired=true;}
 enqueue(type,state){if(this.run.status==='terminal'||this.terminal)return;const body={type,runId:this.run.runId,configRevision:this.run.config.configRevision,commandId:crypto.randomUUID(),seq:++this.seq,snapshot:structuredClone(state)};if(type==='aerial.complete')this.terminal=body;else this.progress=body;this.saveQueue();return this.flush();}
 saveQueue(){this.save({progress:this.progress,terminal:this.terminal,seq:this.seq});}
 async flush(){if(this.sending)return;const command=this.terminal||this.progress;if(!command)return;this.sending=true;try{const record=await this.send(command);this.lastContact=this.now();this.run=record;if(this.terminal===command)this.terminal=null;if(this.progress===command||record.status==='terminal')this.progress=null;if(record.status==='terminal')this.terminal=null;this.onReconcile(record);this.saveQueue();}catch{this.resumeRequired=true;}finally{this.sending=false;}}
 shouldPause(){return this.run.status==='terminal'||this.now()-this.lastContact>=30000;}
 reconcile(record){this.run=record;this.seq=Math.max(this.seq,record.seq);this.lastContact=this.now();this.resumeRequired=true;if(record.status==='terminal'){this.progress=null;this.terminal=null;}this.saveQueue();this.onReconcile(record);}
 resume(){if(this.shouldPause())return false;this.resumeRequired=false;return true;}
}
