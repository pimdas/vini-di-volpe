export function paymentUrl(value:unknown,expiresAt?:string|null,now=Date.now()):string|null{
 if(typeof value!=='string'||!value.trim())return null;
 if(expiresAt&&(!Number.isFinite(Date.parse(expiresAt))||Date.parse(expiresAt)<=now))return null;
 try{const url=new URL(value.trim());if(url.protocol!=='https:'||url.username||url.password||url.port||url.href.length>2048)return null;
 const host=url.hostname.toLowerCase();return (host==='ing.nl'||host.endsWith('.ing.nl')||(host==='tikkie.me'&&url.pathname.startsWith('/pay/')))?url.href:null;
 }catch{return null}
}
