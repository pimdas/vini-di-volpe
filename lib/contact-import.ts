import {normalizeEmail,validEmail} from './contacts';
import type {ContactInput} from './contacts';
export type SheetRows={name:string;rows:string[][]};
export function parseDelimited(text:string):string[][]{
 text=text.replace(/^\uFEFF/,'');const first=text.split(/\r?\n/)[0]||'';const separator=[';',',','\t'].sort((a,b)=>first.split(b).length-first.split(a).length)[0];
 const rows:string[][]=[];let row:string[]=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++}else if(quoted||!value)quoted=!quoted;else value+=c}else if(!quoted&&(c===separator||c==='\n'||c==='\r')){row.push(value);value='';if(c!==separator){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(x=>x.trim()))rows.push(row);row=[]}}else value+=c}
 if(quoted)throw Error('Het CSV-bestand bevat een niet-afgesloten aanhalingsteken.');row.push(value);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
export function previewContacts(rows:string[][],columns:{email:number;name:number;surname:number;phone:number},existing:Set<string>){
 const contacts:ContactInput[]=[],invalid:{row:number;email:string}[]=[];const seen=new Set<string>();let duplicates=0,known=0;
 rows.forEach((row,index)=>{if(!row.some(x=>x.trim()))return;const email=normalizeEmail(row[columns.email]);const name=[row[columns.name],row[columns.surname]].filter(Boolean).join(' ').trim(),phone=(row[columns.phone]||'').trim();if(!validEmail(email)||name.length>120||phone.length>40){invalid.push({row:index+2,email:email||'(leeg)'});return}if(seen.has(email)){duplicates++;return}seen.add(email);if(existing.has(email))known++;contacts.push({email,name,phone})});return {contacts,invalid,duplicates,known};
}
