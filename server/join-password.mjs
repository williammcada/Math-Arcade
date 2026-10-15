import {randomInt,randomUUID} from 'node:crypto';
// v0.8.0 universal class password: one shared four-letter password that any number of
// students may use. It refreshes every 30 seconds; after an automatic refresh the previous
// password is still accepted for a 10-second grace window so a student mid-typing is not
// rejected. A manual "New password now" rotation invalidates the old password immediately.
// Teacher admission remains the gate: a password never admits a device by itself.
export const JOIN_TTL=30000;
export const JOIN_GRACE=10000;
export function rotatePassword(session,now,{grace=false}={}){
 session.usedPasswords||=[];
 // A code never repeats within the classroom session, including manual rotations.
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ',used=new Set(session.usedPasswords);
 if(used.size>=alphabet.length**4)throw Error('Open a new classroom session.');
 let password;do{password=Array.from({length:4},()=>alphabet[randomInt(alphabet.length)]).join('');}while(used.has(password));
 session.usedPasswords.push(password);
 const old=session.join;
 session.previousJoin=grace&&old?{id:old.id,password:old.password,acceptUntil:old.expiresAt+JOIN_GRACE}:null;
 return session.join={id:randomUUID(),password,expiresAt:now+JOIN_TTL};
}
export function currentPassword(session,now){if(!session.join||session.join.expiresAt<=now)return rotatePassword(session,now,{grace:true});return session.join;}
// Returns the join record the typed password matches (current, or previous within grace), or null.
export function matchPassword(session,now,typed){
 const join=currentPassword(session,now);
 if(typeof typed!=='string')return null;
 const p=typed.trim().toUpperCase();
 if(p===join.password)return join;
 const prev=session.previousJoin;
 if(prev&&prev.acceptUntil>now&&p===prev.password)return prev;
 return null;
}
