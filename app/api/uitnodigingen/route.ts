import {env} from '../../../lib/runtime';
import {normalizeEmail,validEmail} from '../../../lib/contacts';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open het formulier vanaf deze website.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Ongeldig formulier.'},415);
 const raw=await request.text();if(raw.length>3000)return json({error:'Te veel gegevens.'},413);
 let input:Record<string,unknown>;try{input=JSON.parse(raw);if(!input||typeof input!=='object'||Array.isArray(input))throw Error()}catch{return json({error:'Ongeldig formulier.'},400)}
 if(input.website)return json({ok:true});
 const name=typeof input.name==='string'?input.name.trim():'',email=normalizeEmail(input.email);
 if(!name||name.length>120||!validEmail(email)||input.consent!=='yes')return json({error:'Vul je naam en een geldig e-mailadres in en geef toestemming voor de uitnodigingen.'},400);
 try{await env.DB.prepare(`INSERT INTO contacts(email,name,phone,invite,source,updated_at) VALUES (?,?,'',1,'Website',?) ON CONFLICT(email) DO UPDATE SET name=CASE WHEN contacts.name='' THEN excluded.name ELSE contacts.name END,invite=1,updated_at=excluded.updated_at`).bind(email,name,new Date().toISOString()).run();return json({ok:true})}catch{return json({error:'Opslaan lukt nu niet. Probeer het later opnieuw.'},503)}
}
