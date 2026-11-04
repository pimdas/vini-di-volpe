import {randomBytes,timingSafeEqual} from 'node:crypto';
import {sqlite} from '../../../lib/runtime';
import {digest,hashPassword,verifyPassword,SESSION_COOKIE} from '../../../lib/admin-auth';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open dit formulier vanaf de website.'},403);
 const raw=await request.text();if(raw.length>4096)return json({error:'Te veel gegevens.'},413);
 let body;try{body=JSON.parse(raw)}catch{return json({error:'Ongeldig formulier.'},400)}
 if(!body||typeof body.password!=='string'||body.password.length>128)return json({error:'Controleer het wachtwoord.'},400);
 const db=sqlite(),now=Date.now();const attempts=db.prepare('SELECT count,expires FROM _login_attempts WHERE id=1').get();
 if(attempts&&Number(attempts.expires)>now&&Number(attempts.count)>=10)return json({error:'Te veel pogingen. Probeer over 15 minuten opnieuw.'},429);
 db.prepare('INSERT INTO _login_attempts VALUES (1,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN expires>? THEN count+1 ELSE 1 END,expires=CASE WHEN expires>? THEN expires ELSE excluded.expires END').run(now+900000,now,now);
 const admin=db.prepare('SELECT email,password FROM _admin WHERE id=1').get();
 if(!admin){
 const expected=process.env.ADMIN_SETUP_TOKEN||'',supplied=typeof body.setupToken==='string'?body.setupToken:'';
 if(!expected||!timingSafeEqual(Buffer.from(digest(expected)),Buffer.from(digest(supplied))))return json({error:'De eenmalige beheercode klopt niet.'},403);
 if(body.password.length<12)return json({error:'Kies een wachtwoord van minimaal 12 tekens.'},400);
 const email=(process.env.ADMIN_EMAILS||'').split(',')[0]?.trim().toLowerCase();if(!email)return json({error:'Het beheerdersadres is nog niet ingesteld.'},503);
 const hash=await hashPassword(body.password);const result=db.prepare('INSERT INTO _admin(id,email,password) VALUES (1,?,?) ON CONFLICT DO NOTHING').run(email,hash);if(!result.changes)return json({error:'Beheer is intussen ingesteld. Laad de pagina opnieuw.'},409);
 }else if(!await verifyPassword(body.password,String(admin.password)))return json({error:'Het wachtwoord klopt niet.'},401);
 db.prepare('DELETE FROM _login_attempts').run();db.prepare('DELETE FROM _sessions WHERE expires<=?').run(now);
 const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO _sessions VALUES (?,?)').run(digest(token),now+8*3600000);
 const secure=new URL(request.url).hostname!=='localhost'&&new URL(request.url).hostname!=='127.0.0.1';
 return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':`${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure?'; Secure':''}`}})
}
