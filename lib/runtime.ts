import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
let connection:DatabaseSync|undefined;
export function sqlite(){
 if(connection)return connection;
 const filename=process.env.DATABASE_PATH||resolve('.data/vini.sqlite');mkdirSync(dirname(filename),{recursive:true});
 const db=new DatabaseSync(filename);db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
 db.exec('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL)');
 for(const name of readdirSync(resolve('drizzle')).filter(n=>n.endsWith('.sql')).sort()){
 const sql=readFileSync(resolve('drizzle',name),'utf8'),checksum=createHash('sha256').update(sql).digest('hex');const applied=db.prepare('SELECT checksum FROM _migrations WHERE name=?').get(name);
 if(applied){if(applied.checksum!==checksum)throw Error(`Applied migration changed: ${name}`);continue}
 db.exec('BEGIN IMMEDIATE');try{db.exec(sql);db.prepare('INSERT INTO _migrations VALUES (?,?)').run(name,checksum);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');db.close();throw e}
 }
 db.exec(`CREATE TABLE IF NOT EXISTS _admin (id INTEGER PRIMARY KEY CHECK(id=1), email TEXT NOT NULL, password TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS _sessions (hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS _login_attempts (id INTEGER PRIMARY KEY CHECK(id=1), count INTEGER NOT NULL, expires INTEGER NOT NULL);`);
 db.exec(`CREATE TABLE IF NOT EXISTS _users (id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,password TEXT NOT NULL,owner INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1);
 CREATE TABLE IF NOT EXISTS _user_login_attempts (key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);`);
 if(!db.prepare('PRAGMA table_info(_sessions)').all().some(c=>c.name==='user_id'))db.exec('ALTER TABLE _sessions ADD COLUMN user_id TEXT REFERENCES _users(id)');
 db.prepare("INSERT OR IGNORE INTO _users(id,email,name,password,owner) SELECT 'legacy-owner',lower(trim(email)),'Beheerder',password,1 FROM _admin WHERE id=1").run();
 db.prepare("UPDATE _sessions SET user_id='legacy-owner' WHERE user_id IS NULL AND EXISTS(SELECT 1 FROM _users WHERE id='legacy-owner')").run();
 connection=db;return db;
}
class Statement{
 constructor(readonly sql:string,readonly values:any[]=[]){ }
 bind(...values:any[]){return new Statement(this.sql,values)}
 async first<T=Record<string,unknown>>(){const row=sqlite().prepare(this.sql).get(...this.values);return (row?{...row}:null) as T|null}
 async all<T=Record<string,unknown>>(){return {results:sqlite().prepare(this.sql).all(...this.values).map(row=>({...row})) as T[]}}
 async run(){const result=sqlite().prepare(this.sql).run(...this.values);return {success:true,meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}}}
 execute(){const stmt=sqlite().prepare(this.sql);if(/^\s*(SELECT|WITH|PRAGMA)/i.test(this.sql))return {results:stmt.all(...this.values).map(row=>({...row}))};const r=stmt.run(...this.values);return {results:[],success:true,meta:{changes:Number(r.changes)}}}
}
const database={prepare:(sql:string)=>new Statement(sql),async batch(statements:Statement[]){const db=sqlite();db.exec('BEGIN IMMEDIATE');try{const results=statements.map(s=>s.execute());db.exec('COMMIT');return results}catch(e){db.exec('ROLLBACK');throw e}}};
export const env={get DB(){return database},get ADMIN_EMAILS(){return process.env.ADMIN_EMAILS||''}};
