import {paymentUrl as safePaymentUrl} from '../../../lib/payment';
import {env} from 'cloudflare:workers';
import {validateBooking} from '../../../lib/registration';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open het formulier vanaf deze website.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Gebruik het aanmeldformulier.'},415);
 const text=await request.text();if(text.length>8192)return json({error:'Het formulier bevat te veel gegevens.'},413);
 let input:Record<string,unknown>;try{input=JSON.parse(text);if(!input||typeof input!=='object'||Array.isArray(input))throw Error()}catch{return json({error:'Ongeldig formulier.'},400)}
 if(input.website)return json({error:'Aanmelden is niet gelukt.'},400);
 const {errors,value:v}=validateBooking(input);if(Object.keys(errors).length)return json({errors},400);
 if(!env.DB)return json({error:'Aanmelden is tijdelijk niet beschikbaar. Je gegevens zijn niet opgeslagen.'},503);
 try{
 const existing=await env.DB.prepare('SELECT b.id,b.name,b.email,b.phone,b.edition_id,b.people,e.payment_url,e.payment_expires_at FROM bookings b JOIN editions e ON b.edition_id=e.id WHERE b.request_id=?').bind(v.requestId).first<{id:string;name:string;email:string;phone:string;edition_id:string;people:number;payment_url:string|null;payment_expires_at:string|null}>();
 if(existing){if(existing.name!==v.name||existing.email!==v.email||existing.phone!==v.phone||existing.edition_id!==v.editionId||existing.people!==v.people)return json({error:'Deze verzendpoging hoort bij een andere aanmelding. Vernieuw het formulier.'},409);return json({reference:existing.id,paymentUrl:safePaymentUrl(existing.payment_url,existing.payment_expires_at)?`/betalen/${encodeURIComponent(v.editionId)}`:null})}
 const now=new Date().toISOString();const id=`VOLPE-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
 const result=await env.DB.prepare(`INSERT INTO bookings (id,request_id,edition_id,name,email,phone,people,total_cents,status,created_at) SELECT ?,?,e.id,?,?,?,?,e.price_cents * ?,'awaiting_payment',? FROM editions e WHERE e.id=? AND e.open=1 AND e.starts_at>? AND e.closes_at>? AND e.capacity >= ? + COALESCE((SELECT SUM(b.people) FROM bookings b WHERE b.edition_id=e.id AND b.status <> 'cancelled'),0) ON CONFLICT DO NOTHING`).bind(id,v.requestId,v.name,v.email,v.phone,v.people,v.people,now,v.editionId,now,now,v.people).run();
 if(!result.meta.changes){const edition=await env.DB.prepare('SELECT id FROM editions WHERE id=? AND open=1 AND starts_at>? AND closes_at>?').bind(v.editionId,now,now).first();return json({error:edition?'Deze aanmelding kon niet worden opgeslagen. De editie is vol of dit e-mailadres is al voor deze editie aangemeld. Neem contact op met de organisatie.':'Deze editie is niet geopend voor inschrijving. Kies een beschikbare editie.'},409)}
 const edition=await env.DB.prepare('SELECT payment_url,payment_expires_at FROM editions WHERE id=?').bind(v.editionId).first<{payment_url:string|null;payment_expires_at:string|null}>();
 return json({reference:id,paymentUrl:safePaymentUrl(edition?.payment_url??null,edition?.payment_expires_at)?`/betalen/${encodeURIComponent(v.editionId)}`:null},201);
 }catch{return json({error:'Opslaan is tijdelijk niet gelukt. Probeer opnieuw met dit formulier.'},503)}
}
