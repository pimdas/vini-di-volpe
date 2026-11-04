import {validateContacts,normalizeEmail,validEmail} from '../../../lib/contacts';
import {env} from 'cloudflare:workers';
import {getAdmin} from '../../../lib/admin-auth';
import {adminData} from '../../../lib/admin-data';
import {editionLabel} from '../../../lib/registration';
import {paymentUrl} from '../../../lib/payment';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export async function GET(){if(!await getAdmin())return json({error:'Geen toegang tot het beheer.'},403);try{return json(await adminData())}catch{return json({error:'Het overzicht kon niet worden geladen.'},503)}}
const str=(v:unknown,max=200)=>typeof v==='string'?v.trim().slice(0,max+1):'';
const validDate=(v:unknown)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v)&&Number.isFinite(Date.parse(v));
export async function POST(request:Request){
 const admin=await getAdmin();if(!admin)return json({error:'Geen toegang tot het beheer.'},403);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open het beheer vanaf deze website.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Ongeldig formulier.'},415);
 if(!env.DB)return json({error:'De opslag is tijdelijk niet beschikbaar.'},503);
 const raw=await request.text();if(raw.length>600000)return json({error:'Te veel gegevens.'},413);
 let input:Record<string,unknown>;try{input=JSON.parse(raw);if(!input||typeof input!=='object'||Array.isArray(input))throw Error()}catch{return json({error:'Ongeldig formulier.'},400)}
 const id=str(input.id,100);try{
 if(input.action==='contact-import'){
 let contacts;try{contacts=validateContacts(input.contacts)}catch(e){return json({error:(e as Error).message},400)}
 const now=new Date().toISOString();
 for(let offset=0;offset<contacts.length;offset+=50){await env.DB.batch(contacts.slice(offset,offset+50).map(c=>env.DB!.prepare(`INSERT INTO contacts(email,name,phone,invite,source,updated_at) VALUES (?,?,?,1,'Import',?) ON CONFLICT(email) DO UPDATE SET name=CASE WHEN contacts.name='' THEN excluded.name ELSE contacts.name END,phone=CASE WHEN contacts.phone='' THEN excluded.phone ELSE contacts.phone END,updated_at=excluded.updated_at`).bind(c.email,c.name,c.phone,now)))}
 }else if(input.action==='contact-invite'){
 const email=normalizeEmail(input.email);if(!validEmail(email)||typeof input.invite!=='boolean')return json({error:'Ongeldig contact.'},400);
 const exists=await env.DB.prepare('SELECT email FROM contacts WHERE email=? UNION SELECT email FROM bookings WHERE lower(trim(email))=? LIMIT 1').bind(email,email).first();if(!exists)return json({error:'Dit contact bestaat niet meer.'},404);
 await env.DB.prepare(`INSERT INTO contacts(email,name,phone,invite,source,updated_at) VALUES (?,'','',?,'Aanmelding',?) ON CONFLICT(email) DO UPDATE SET invite=excluded.invite,updated_at=excluded.updated_at`).bind(email,input.invite?1:0,new Date().toISOString()).run();
 }else if(input.action==='round'){
 const title=str(input.title,120),theme=str(input.theme,240),description=str(input.description,1200);if(description.length>1200)return json({error:'Gebruik maximaal 1200 tekens voor de beschrijving.'},400);if(!title||title.length>120||!theme||theme.length>240)return json({error:'Vul een proeverijnaam en thema in (maximaal 120 en 240 tekens).'},400);
 if(id){const result=await env.DB.prepare('UPDATE rounds SET title=?,theme=?,description=? WHERE id=?').bind(title,theme,description,id).run();if(!result.meta.changes)return json({error:'Deze proeverij bestaat niet meer.'},404)}else{await env.DB.prepare('INSERT INTO rounds(id,title,theme,description) VALUES (?,?,?,?)').bind(crypto.randomUUID(),title,theme,description).run()}
 }else if(input.action==='paid'){
 if(!id||typeof input.paid!=='boolean'||!['paid','awaiting_payment'].includes(String(input.expectedStatus)))return json({error:'Ongeldige betaalstatus.'},400);
 const result=await env.DB.prepare('UPDATE bookings SET status=?,paid_at=?,paid_by=? WHERE id=? AND status=?').bind(input.paid?'paid':'awaiting_payment',input.paid?new Date().toISOString():null,input.paid?admin.email:null,id,input.expectedStatus).run();
 if(!result.meta.changes)return json({error:'Deze aanmelding is intussen gewijzigd. Vernieuw het overzicht.'},409);
 }else if(input.action==='payment'){
 const link=str(input.paymentUrl,2048);const expires=input.paymentExpiresAt||null;const version=Number(input.version);
 if(!id||!Number.isInteger(version)||version<0||(link&&!paymentUrl(link))||(expires&&!validDate(expires)))return json({error:'Gebruik een volledige HTTPS-betaallink van ING of Tikkie en een geldige vervaldatum.'},400);
 const result=await env.DB.prepare('UPDATE editions SET payment_url=?,payment_expires_at=?,version=version+1 WHERE id=? AND version=?').bind(link||null,expires,id,version).run();if(!result.meta.changes)return json({error:'Deze editie is intussen gewijzigd. Vernieuw en probeer opnieuw.'},409);
 }else if(input.action==='edition'){
 const roundId=str(input.roundId,100),location=str(input.location,160),address=str(input.address,240),link=str(input.paymentUrl,2048);
 const price=Number(input.priceCents),capacity=Number(input.capacity),version=Number(input.version);const expires=input.paymentExpiresAt||null;
 if(!roundId||!location||location.length>160||!address||address.length>240||!Number.isInteger(price)||price<0||price>95000||!Number.isInteger(capacity)||capacity<1||capacity>5000||typeof input.open!=='boolean'||!validDate(input.startsAt)||!validDate(input.endsAt)||!validDate(input.closesAt)||(expires&&!validDate(expires))||(link&&!paymentUrl(link)))return json({error:'Controleer de proeverij, locatie, data, prijs, capaciteit en betaallink.'},400);
 const title=editionLabel(String(input.startsAt),String(input.endsAt));
 if(String(input.endsAt)<=String(input.startsAt)||String(input.closesAt)>String(input.startsAt))return json({error:'De eindtijd moet na de start liggen en de inschrijving sluit uiterlijk bij de start.'},400);
 if(input.open&&(Date.parse(String(input.startsAt))<=Date.now()||Date.parse(String(input.closesAt))<=Date.now()||!paymentUrl(link,expires as string|null)))return json({error:'Openen kan alleen met toekomstige data en een geldige, niet-verlopen betaallink.'},400);
 if(!await env.DB.prepare('SELECT id FROM rounds WHERE id=?').bind(roundId).first())return json({error:'Kies een bestaande proeverij.'},400);
 if(id){if(!Number.isInteger(version)||version<0)return json({error:'Vernieuw het formulier.'},400);const result=await env.DB.prepare(`UPDATE editions SET round_id=?,title=?,starts_at=?,ends_at=?,location=?,address=?,price_cents=?,capacity=?,open=?,closes_at=?,payment_url=?,payment_expires_at=?,version=version+1 WHERE id=? AND version=? AND ? >= COALESCE((SELECT SUM(people) FROM bookings WHERE edition_id=? AND status<>'cancelled'),0)`).bind(roundId,title,input.startsAt,input.endsAt,location,address,price,capacity,input.open?1:0,input.closesAt,link||null,expires,id,version,capacity,id).run();if(!result.meta.changes)return json({error:'Niet opgeslagen: de editie is intussen gewijzigd of de capaciteit is lager dan het aantal aangemelde personen.'},409)
 }else await env.DB.prepare('INSERT INTO editions(id,round_id,title,starts_at,ends_at,location,address,price_cents,capacity,open,closes_at,payment_url,payment_expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),roundId,title,input.startsAt,input.endsAt,location,address,price,capacity,input.open?1:0,input.closesAt,link||null,expires).run();
 }else return json({error:'Onbekende bewerking.'},400);
 return json(await adminData());
 }catch{return json({error:'Opslaan is tijdelijk niet gelukt. Je invoer blijft in het formulier staan.'},503)}
}
