import {randomUUID} from 'node:crypto';
import {getAdmin,hashPassword,verifyPassword} from '../../../lib/admin-auth';
import {sqlite} from '../../../lib/runtime';
import {normalizeEmail,validEmail} from '../../../lib/contacts';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export async function GET(){const admin=await getAdmin();if(!admin)return json({error:'Log opnieuw in.'},403);return json({users:sqlite().prepare('SELECT id,name,email,owner,active FROM _users WHERE owner>=? ORDER BY owner DESC,name,email').all(admin.owner?0:2)})}
export async function POST(request:Request){
 const admin=await getAdmin();if(!admin)return json({error:'Log opnieuw in.'},403);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open het formulier vanaf deze website.'},403);
 const raw=await request.text();if(raw.length>4096)return json({error:'Te veel gegevens.'},413);
 let input;try{input=JSON.parse(raw);if(!input||typeof input!=='object')throw Error()}catch{return json({error:'Ongeldig formulier.'},400)}
 const db=sqlite(),password=typeof input.password==='string'?input.password:'';
 if(input.action==='password'){
 if(password.length<12||password.length>128)return json({error:'Kies een wachtwoord van 12 tot en met 128 tekens.'},400);
 const current=db.prepare('SELECT password FROM _users WHERE id=? AND active=1').get(admin.userId);
 if(typeof input.currentPassword!=='string'||input.currentPassword.length>128||!current||!await verifyPassword(input.currentPassword,String(current.password)))return json({error:'Je huidige wachtwoord klopt niet.'},400);
 const hash=await hashPassword(password);db.exec('BEGIN IMMEDIATE');try{db.prepare('UPDATE _users SET password=? WHERE id=?').run(hash,admin.userId);db.prepare('DELETE FROM _sessions WHERE user_id=?').run(admin.userId);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}return json({ok:true,login:true});
 }
 if(!admin.owner)return json({error:'Alleen de hoofdbeheerder kan gebruikers beheren.'},403);
 const id=typeof input.id==='string'?input.id:'';
 try{
 if(input.action==='create'){
 const email=normalizeEmail(input.email),name=typeof input.name==='string'?input.name.trim():'';
 if(!name||name.length>120||!validEmail(email)||password.length<12||password.length>128)return json({error:'Vul een naam, geldig e-mailadres en wachtwoord van 12 tot en met 128 tekens in.'},400);
 const hash=await hashPassword(password);db.prepare('INSERT INTO _users(id,email,name,password) VALUES (?,?,?,?)').run(randomUUID(),email,name,hash);
 }else if(input.action==='active'){
 if(typeof input.active!=='boolean')return json({error:'Ongeldige status.'},400);
 db.exec('BEGIN IMMEDIATE');try{const result=db.prepare('UPDATE _users SET active=? WHERE id=? AND owner=0').run(input.active?1:0,id);if(!result.changes){db.exec('ROLLBACK');return json({error:'Deze gebruiker kan niet worden gewijzigd.'},400)}db.prepare('DELETE FROM _sessions WHERE user_id=?').run(id);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
 }else if(input.action==='reset'){
 if(password.length<12||password.length>128)return json({error:'Kies een wachtwoord van 12 tot en met 128 tekens.'},400);
 const hash=await hashPassword(password);db.exec('BEGIN IMMEDIATE');try{const result=db.prepare('UPDATE _users SET password=? WHERE id=? AND owner=0').run(hash,id);if(!result.changes){db.exec('ROLLBACK');return json({error:'Deze gebruiker kan niet worden gewijzigd.'},400)}db.prepare('DELETE FROM _sessions WHERE user_id=?').run(id);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
 }else return json({error:'Onbekende bewerking.'},400);
 return json({ok:true});
 }catch(e){if(String(e).includes('UNIQUE'))return json({error:'Dit e-mailadres heeft al een account.'},409);return json({error:'Opslaan is niet gelukt. Probeer opnieuw.'},503)}
}
