import {randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import {sqlite} from '../../../lib/runtime';
import {normalizeEmail,validEmail} from '../../../lib/contacts';
import {digest,hashPassword,verifyPassword,SESSION_COOKIE} from '../../../lib/admin-auth';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open dit formulier vanaf de website.'},403);
 const raw=await request.text();if(raw.length>4096)return json({error:'Te veel gegevens.'},413);
 let body;try{body=JSON.parse(raw)}catch{return json({error:'Ongeldig formulier.'},400)}
 if(!body||typeof body.password!=='string'||body.password.length>128)return json({error:'Controleer je e-mailadres en wachtwoord.'},400);
 const db=sqlite(),now=Date.now();const setup=!db.prepare('SELECT id FROM _users LIMIT 1').get();
 const email=normalizeEmail(setup?(process.env.ADMIN_EMAILS||'').split(',')[0]:body.email);
 if(!validEmail(email))return json({error:'Vul een geldig e-mailadres in.'},400);
 const key=digest(email),attempts=db.prepare('SELECT count,expires FROM _user_login_attempts WHERE key=?').get(key);
 if(attempts&&Number(attempts.expires)>now&&Number(attempts.count)>=10)return json({error:'Te veel pogingen. Probeer over 15 minuten opnieuw.'},429);
 db.prepare('DELETE FROM _user_login_attempts WHERE expires<=?').run(now);
 db.prepare('INSERT INTO _user_login_attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,now+900000);
 let user=db.prepare('SELECT id,password,active FROM _users WHERE email=?').get(email);
 if(setup){
 const expected=process.env.ADMIN_SETUP_TOKEN||'',supplied=typeof body.setupToken==='string'?body.setupToken:'';
 if(!expected||!timingSafeEqual(Buffer.from(digest(expected)),Buffer.from(digest(supplied))))return json({error:'De eenmalige beheercode klopt niet.'},403);
 if(body.password.length<12)return json({error:'Kies een wachtwoord van minimaal 12 tekens.'},400);
 const password=await hashPassword(body.password),id=randomUUID();
 const result=db.prepare('INSERT INTO _users(id,email,name,password,owner) SELECT ?,?,?,?,1 WHERE NOT EXISTS(SELECT 1 FROM _users)').run(id,email,'Beheerder',password);if(!result.changes)return json({error:'Beheer is intussen ingesteld. Laad de pagina opnieuw.'},409);
 user={id,password,active:1};
 }else{
 const valid=await verifyPassword(body.password,user?String(user.password):'00000000000000000000000000000000:'+ '00'.repeat(64));
 if(!user||!user.active||!valid)return json({error:'E-mailadres of wachtwoord klopt niet.'},401);
 }
 db.prepare('DELETE FROM _user_login_attempts WHERE key=?').run(key);db.prepare('DELETE FROM _sessions WHERE expires<=?').run(now);
 const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO _sessions(hash,expires,user_id) VALUES (?,?,?)').run(digest(token),now+8*3600000,String(user!.id));
 const secure=!['localhost','127.0.0.1'].includes(new URL(request.url).hostname);
 return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':`${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure?'; Secure':''}`}})
}
