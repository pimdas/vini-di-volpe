import { env } from 'cloudflare:workers';
import type {Edition} from './registration';
export async function getOpenEditions():Promise<Edition[]>{
 if(!env.DB)throw new Error('Database niet beschikbaar');
 const now=new Date().toISOString();
 const {results}=await env.DB.prepare(`SELECT e.id, r.title AS roundTitle, r.theme, r.description, e.title, e.starts_at AS startsAt, e.ends_at AS endsAt, e.location, e.address, e.price_cents AS priceCents, e.payment_url AS paymentUrl, MAX(0,e.capacity - COALESCE((SELECT SUM(b.people) FROM bookings b WHERE b.edition_id=e.id AND b.status <> 'cancelled'),0)) AS remaining FROM editions e JOIN rounds r ON r.id=e.round_id WHERE e.open=1 AND e.closes_at>? AND e.starts_at>? ORDER BY e.starts_at`).bind(now,now).all<Edition>();
 return results;
}
