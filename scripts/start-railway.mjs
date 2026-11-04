import {spawn} from 'node:child_process';
process.env.HOST='0.0.0.0';process.env.PORT||='8080';
const child=spawn(process.execPath,['dist/standalone/server.js'],{stdio:'inherit',env:process.env});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
