import {cookies} from 'next/headers';
import {createHash,randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {sqlite} from './runtime';
const derive=promisify(scrypt);
export const SESSION_COOKIE='volpe_admin_session';
export const digest=(v:string)=>createHash('sha256').update(v).digest('hex');
export function hasAdmin(){return !!sqlite().prepare('SELECT id FROM _admin WHERE id=1').get()}
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const key=await derive(password,salt,64) as Buffer;return `${salt}:${key.toString('hex')}`}
export async function verifyPassword(password:string,encoded:string){const [salt,hex]=encoded.split(':');if(!salt||!hex)return false;const key=await derive(password,salt,64) as Buffer;const expected=Buffer.from(hex,'hex');return key.length===expected.length&&timingSafeEqual(key,expected)}
export async function getAdmin(){const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token||token.length>200)return null;const session=sqlite().prepare('SELECT expires FROM _sessions WHERE hash=? AND expires>?').get(digest(token),Date.now());if(!session)return null;const admin=sqlite().prepare('SELECT email FROM _admin WHERE id=1').get();return admin?{email:String(admin.email),userId:'administrator',displayName:'Beheerder'}:null}
