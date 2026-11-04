export type Edition = {id:string;roundTitle:string;theme:string;description?:string;title:string;startsAt:string;endsAt:string;location:string;address:string;priceCents:number;remaining:number;paymentUrl:string|null};
export const money=(cents:number)=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(cents/100);
export function validateBooking(input:Record<string,unknown>){
 const name=typeof input.name==='string'?input.name.trim():'';
 const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
 const phone=typeof input.phone==='string'?input.phone.trim():'';
 const editionId=typeof input.editionId==='string'?input.editionId:'';
 const people=Number(input.people);
 const requestId=typeof input.requestId==='string'?input.requestId:'';
 const errors:Record<string,string>={};
 if(name.length<2||name.length>120) errors.name='Vul de volledige naam van de hoofdboeker in (2–120 tekens).';
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))errors.email='Vul een geldig e-mailadres in.';
 if(!/^[+()\d\s.-]{6,30}$/.test(phone)||phone.replace(/\D/g,'').length<8||phone.replace(/\D/g,'').length>15)errors.phone='Vul een geldig telefoonnummer in.';
 if(!editionId||editionId.length>100)errors.editionId='Kies een editie.';
 if(!Number.isInteger(people)||people<1||people>10)errors.people='Kies 1 tot en met 10 personen, inclusief jezelf.';
 if(!/^[a-f0-9-]{36}$/i.test(requestId))errors.form='Je formulier is verlopen. Vernieuw de pagina en probeer opnieuw.';
 return {errors,value:{name,email,phone,editionId,people,requestId}};
}

export function editionLabel(startsAt:string,endsAt?:string){
 if(!startsAt)return 'Datum en tijd volgen';
 const start=new Intl.DateTimeFormat('nl-NL',{weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Amsterdam'}).format(new Date(startsAt));
 const end=endsAt?new Intl.DateTimeFormat('nl-NL',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Amsterdam'}).format(new Date(endsAt)):'';
 return end?`${start}–${end}`:start;
}
