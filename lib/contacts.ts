import type {Booking} from './admin-types';
export type Contact={email:string;name:string;phone:string;invite:boolean;source:string;lastBooking:string|null};
export type ContactInput={email:string;name:string;phone:string};
export const normalizeEmail=(v:unknown)=>typeof v==='string'?v.trim().toLowerCase():'';
export const validEmail=(v:string)=>v.length<=254&&/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(v);
export function mergeContacts(bookings:Booking[],saved:Contact[]):Contact[]{
 const map=new Map<string,Contact>();
 for(const b of [...bookings].sort((a,b)=>a.createdAt.localeCompare(b.createdAt))){const email=normalizeEmail(b.email);if(validEmail(email))map.set(email,{email,name:b.name,phone:b.phone,invite:true,source:'Aanmelding',lastBooking:b.createdAt})}
 for(const c of saved){const old=map.get(c.email);map.set(c.email,{...c,name:old?.name||c.name,phone:old?.phone||c.phone,invite:!!c.invite,source:old?'Aanmelding':c.source,lastBooking:old?.lastBooking||null})}
 return [...map.values()].sort((a,b)=>(a.name||a.email).localeCompare(b.name||b.email,'nl'));
}
export function validateContacts(rows:unknown):ContactInput[]{
 if(!Array.isArray(rows)||!rows.length||rows.length>1000)throw Error('Importeer 1 tot en met 1000 contacten per keer.');
 const map=new Map<string,ContactInput>();
 for(const row of rows){if(!row||typeof row!=='object')throw Error('Ongeldige contactgegevens.');const r=row as Record<string,unknown>;const email=normalizeEmail(r.email),name=typeof r.name==='string'?r.name.trim():'',phone=typeof r.phone==='string'?r.phone.trim():'';if(!validEmail(email)||name.length>120||phone.length>40)throw Error('Controleer de e-mailadressen, namen (maximaal 120 tekens) en telefoonnummers (maximaal 40 tekens).');const old=map.get(email);map.set(email,{email,name:old?.name||name,phone:old?.phone||phone})}
 return [...map.values()];
}
