import {randomInt,randomUUID} from 'node:crypto';
export const JOIN_TTL=45000;
export function rotatePassword(session,now){
 session.usedPasswords||=[];
 // A code never repeats within the classroom session, including manual rotations.
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ',used=new Set(session.usedPasswords);
 if(used.size>=alphabet.length**4)throw Error('Open a new classroom session.');
 let password;do{password=Array.from({length:4},()=>alphabet[randomInt(alphabet.length)]).join('');}while(used.has(password));
 session.usedPasswords.push(password);
 return session.join={id:randomUUID(),password,expiresAt:now+JOIN_TTL,used:false};
}
export function currentPassword(session,now){if(!session.join||session.join.expiresAt<=now)return rotatePassword(session,now);return session.join;}
