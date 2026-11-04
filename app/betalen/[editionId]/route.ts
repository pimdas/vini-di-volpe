import {env} from '../../../lib/runtime';
import {paymentUrl} from '../../../lib/payment';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{editionId:string}>}){
 const {editionId}=await params;
 if(!env.DB)return new Response('Het betaalverzoek is tijdelijk niet beschikbaar. Probeer later opnieuw.',{status:503,headers:{'Cache-Control':'no-store'}});
 const edition=await env.DB.prepare('SELECT payment_url,payment_expires_at FROM editions WHERE id=?').bind(editionId).first<{payment_url:string|null;payment_expires_at:string|null}>();
 const link=paymentUrl(edition?.payment_url,edition?.payment_expires_at);
 if(link)return new Response(null,{status:302,headers:{Location:link,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 return new Response('<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Betaalverzoek — Vini di Volpe</title><body style="font-family:Arial,sans-serif;max-width:600px;margin:60px auto;padding:24px;line-height:1.6"><h1>Het betaalverzoek is niet beschikbaar</h1><p>Deze betaallink is verlopen of nog niet ingesteld. Je hoeft je niet opnieuw aan te melden. Neem contact op met de organisatie voor een nieuw betaalverzoek.</p><a href="/">Terug naar Vini di Volpe</a></body></html>',{status:410,headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'}})
}
