import {mergeContacts} from './contacts';
import type {Contact} from './contacts';
import {env} from 'cloudflare:workers';
import type {AdminData,Round,AdminEdition,Booking} from './admin-types';
export async function adminData():Promise<AdminData>{if(!env.DB)throw Error('Database niet beschikbaar');const result=await env.DB.batch([
 env.DB.prepare('SELECT id,title,theme,description FROM rounds ORDER BY rowid DESC'),
 env.DB.prepare('SELECT id,round_id AS roundId,title,starts_at AS startsAt,ends_at AS endsAt,location,address,price_cents AS priceCents,capacity,open,closes_at AS closesAt,payment_url AS paymentUrl,payment_expires_at AS paymentExpiresAt,version FROM editions ORDER BY starts_at DESC'),
 env.DB.prepare('SELECT id,edition_id AS editionId,name,email,phone,people,total_cents AS totalCents,status,created_at AS createdAt,paid_at AS paidAt,paid_by AS paidBy FROM bookings ORDER BY created_at DESC,id DESC'),
 env.DB.prepare('SELECT email,name,phone,invite,source FROM contacts')]);
 return {rounds:result[0].results as Round[],editions:result[1].results as AdminEdition[],bookings:result[2].results as Booking[],contacts:mergeContacts(result[2].results as Booking[],result[3].results as Contact[])}}
