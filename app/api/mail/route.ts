import {randomUUID} from 'node:crypto';
import {getAdmin} from '../../../lib/admin-auth';
import {sqlite} from '../../../lib/runtime';
import {adminData} from '../../../lib/admin-data';
import {mailConfig,mailContent,unsubscribeToken,enqueueConfirmation} from '../../../lib/mail';
import {editionLabel,money} from '../../../lib/registration';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export async function GET(){const admin=await getAdmin();if(!admin)return json({error:'Log opnieuw in.'},403);const db=sqlite();return json({config:{...mailConfig()},campaigns:db.prepare('SELECT id,subject,body,recipients,status,tested,created_at FROM mail_campaigns ORDER BY created_at DESC LIMIT 30').all(),jobs:db.prepare('SELECT id,kind,email,name,subject,status,error,created_at,updated_at,campaign_id FROM mail_jobs ORDER BY created_at DESC LIMIT 500').all()})}
export async function POST(request:Request){const admin=await getAdmin();if(!admin)return json({error:'Log opnieuw in.'},403);if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Open het formulier vanaf deze website.'},403);const raw=await request.text();if(raw.length>100000)return json({error:'Te veel gegevens.'},413);let input;try{input=JSON.parse(raw);if(!input||typeof input!=='object')throw Error()}catch{return json({error:'Ongeldig formulier.'},400)}const db=sqlite(),now=new Date().toISOString();try{
 if(input.action==='connection-test'){
 if(!mailConfig().configured)return json({error:'De Brevo-koppeling is nog niet ingesteld.'},400);
 const count=Number(db.prepare("SELECT COUNT(*) n FROM mail_jobs WHERE kind='test' AND email=? AND created_at>?").get(admin.email,new Date(Date.now()-3600000).toISOString())!.n);if(count>=5)return json({error:'Maximaal vijf testmails per uur. Probeer het later opnieuw.'},429);
 db.prepare("INSERT INTO mail_jobs(id,kind,email,name,subject,body,created_at,updated_at,next_at) VALUES (?,'test',?,?,?,?,?,?,?)").run(randomUUID(),admin.email,admin.displayName,'Testmail — Vini di Volpe','Dit is een test van de e-mailkoppeling van Vini di Volpe.\n\nOntvang je deze mail? Dan werkt het versturen via Brevo.\nControleer de afzender en klik op Beantwoorden om te controleren dat je reactie naar het ingestelde antwoordadres gaat. Je hoeft deze test niet te beantwoorden.',now,now,now);return json({ok:true,testTo:admin.email});
 }
 if(input.action==='prepare'){
 const subject=typeof input.subject==='string'?input.subject.trim():'',text=typeof input.body==='string'?input.body.trim():'';if(!subject||subject.length>160||/[\r\n]/.test(subject)||!text||text.length>8000||!Array.isArray(input.emails)||!input.emails.length||input.emails.length>500)return json({error:'Vul onderwerp, bericht en 1 tot en met 500 ontvangers in.'},400);
 const data=await adminData(),eligible=data.contacts.filter(c=>c.invite);const recipients=eligible.filter(c=>input.emails.includes(c.email)).map(c=>({email:c.email,name:c.name}));if(!recipients.length||new Set(input.emails).size!==recipients.length)return json({error:'De adressenlijst is gewijzigd. Vernieuw en kies de ontvangers opnieuw.'},409);
 const round=data.rounds.find(r=>r.id===input.roundId);if(!round)return json({error:'Kies een proeverij.'},400);const editions=data.editions.filter(e=>e.roundId===round.id&&e.open&&Date.parse(e.closesAt)>Date.now()&&Date.parse(e.startsAt)>Date.now());if(!editions.length)return json({error:'Open eerst een editie voor deze proeverij.'},400);
 const body=`${text}\n\n${round.title} · ${round.theme}\n\n${editions.map(e=>`${editionLabel(e.startsAt,e.endsAt)}\n${e.location} · ${e.address}\n${money(e.priceCents)} per persoon`).join('\n\n')}\n\nBekijk de proeverij en meld je aan: ${mailConfig().origin||'[websiteadres nog instellen]'}/#proeverij`;
 const id=randomUUID();db.prepare('INSERT INTO mail_campaigns(id,subject,body,recipients,created_at,created_by) VALUES (?,?,?,?,?,?)').run(id,subject,body,JSON.stringify(recipients),now,admin.email);return json({id,subject,body,count:recipients.length,recipients,preview:mailContent({name:'wijnvriend',body,token:'voorbeeld'})});
 }
 if(input.action==='retry'){
 if(!mailConfig().configured)return json({error:'Stel eerst Brevo in.'},400);const result=db.prepare("UPDATE mail_jobs SET status='queued',error=NULL,next_at=?,updated_at=? WHERE id=? AND status='failed'").run(now,now,String(input.jobId||''));if(result.changes)db.prepare("UPDATE mail_campaigns SET status='sending' WHERE status IN ('complete','attention') AND id IN (SELECT campaign_id FROM mail_jobs WHERE id=? AND kind='invitation')").run(String(input.jobId||''));return result.changes?json({ok:true}):json({error:'Alleen een zeker mislukte mail kan opnieuw worden verstuurd. Controleer onzekere verzendingen eerst in Brevo.'},400);
 }
 if(input.action==='confirmation'){
 if(!mailConfig().configured)return json({error:'Stel eerst Brevo in.'},400);if(typeof input.bookingId!=='string')return json({error:'Kies een aanmelding.'},400);enqueueConfirmation(input.bookingId);return json({ok:true});
 }
 const campaign=typeof input.id==='string'?db.prepare('SELECT * FROM mail_campaigns WHERE id=?').get(input.id):null;if(!campaign)return json({error:'Deze uitnodiging bestaat niet.'},404);
 if(input.action==='test'){
 if(!mailConfig().configured)return json({error:'De Brevo-koppeling is nog niet ingesteld.'},400);if(String(campaign.body).includes('[websiteadres nog instellen]'))return json({error:'Maak na het instellen van Brevo een nieuw voorbeeld met het juiste websiteadres.'},400);if(campaign.status!=='draft')return json({error:'Deze uitnodiging is al gestart.'},409);
 const count=Number(db.prepare("SELECT COUNT(*) n FROM mail_jobs WHERE kind='test' AND email=? AND created_at>?").get(admin.email,new Date(Date.now()-3600000).toISOString())!.n);if(count>=5)return json({error:'Maximaal vijf testmails per uur. Wacht even voordat je opnieuw test.'},429);
 db.prepare("INSERT INTO mail_jobs(id,campaign_id,kind,email,name,subject,body,created_at,updated_at,next_at) VALUES (?,?,'test',?,?,?,?,?,?,?)").run(randomUUID(),campaign.id!,admin.email,admin.displayName,`[TEST] ${campaign.subject}`,String(campaign.body)+'\n\nDit is een testmail. De afmeldlink is een voorbeeld.',now,now,now);return json({ok:true,testTo:admin.email});
 }
 if(input.action==='send'){
 if(!mailConfig().configured||!campaign.tested)return json({error:'Verstuur eerst een testmail en wacht tot Brevo deze heeft geaccepteerd.'},400);
 const recipients=JSON.parse(String(campaign.recipients)) as {email:string;name:string}[];const eligible=(await adminData()).contacts.filter(c=>c.invite).map(c=>c.email);const sendTo=recipients.filter(c=>eligible.includes(c.email));if(!sendTo.length)return json({error:'Geen ontvangers meer beschikbaar.'},400);
 db.exec('BEGIN IMMEDIATE');try{const result=db.prepare("UPDATE mail_campaigns SET status='sending' WHERE id=? AND status='draft'").run(campaign.id!);if(!result.changes){db.exec('ROLLBACK');return json({error:'Deze uitnodiging is al gestart.'},409)}for(const c of sendTo)db.prepare("INSERT INTO mail_jobs(id,campaign_id,kind,email,name,subject,body,token,created_at,updated_at,next_at) VALUES (?,?,'invitation',?,?,?,?,?,?,?,?)").run(randomUUID(),campaign.id!,c.email,c.name,campaign.subject!,campaign.body!,unsubscribeToken(c.email),now,now,now);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}return json({ok:true,count:sendTo.length});
 }
 if(input.action==='stop'){db.exec('BEGIN IMMEDIATE');try{db.prepare("UPDATE mail_campaigns SET status='stopped' WHERE id=? AND status='sending'").run(campaign.id!);db.prepare("UPDATE mail_jobs SET status='skipped',updated_at=? WHERE campaign_id=? AND kind='invitation' AND status='queued'").run(now,campaign.id!);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}return json({ok:true})}
 return json({error:'Onbekende actie.'},400);
 }catch{return json({error:'De mailbewerking is niet gelukt. Vernieuw het overzicht voordat je het opnieuw probeert.'},503)}}
