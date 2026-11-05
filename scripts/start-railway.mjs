import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
process.env.HOST='0.0.0.0';process.env.PORT||='8080';
process.env.INTERNAL_MAIL_TOKEN=randomBytes(32).toString('hex');
const child=spawn(process.execPath,['dist/standalone/server.js'],{stdio:'inherit',env:process.env});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));

let mailBusy=false;
const timer=setInterval(async()=>{if(mailBusy||!process.env.BREVO_API_KEY)return;mailBusy=true;try{await fetch(`http://127.0.0.1:${process.env.PORT}/api/mail/dispatch`,{method:'POST',headers:{authorization:`Bearer ${process.env.INTERNAL_MAIL_TOKEN}`},signal:AbortSignal.timeout(180000)})}catch{}finally{mailBusy=false}},15000);timer.unref();
