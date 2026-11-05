import {cookies} from 'next/headers';
import {createHash,randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {sqlite} from './runtime';
const derive=promisify(scrypt);
export const SESSION_COOKIE='volpe_admin_session';
export const digest=(v:string)=>createHash('sha256').update(v).digest('hex');
export function hasAdmin(){return !!sqlite().prepare('SELECT id FROM _users LIMIT 1').get()}
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const key=await derive(password,salt,64) as Buffer;return `${salt}:${key.toString('hex')}`}
export async function verifyPassword(password:string,encoded:string){const [salt,hex]=encoded.split(':');if(!salt||!hex)return false;const key=await derive(password,salt,64) as Buffer;const expected=Buffer.from(hex,'hex');return key.length===expected.length&&timingSafeEqual(key,expected)}
export async function getAdmin(){const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token||token.length>200)return null;const user=sqlite().prepare('SELECT u.id,u.email,u.name,u.owner FROM _sessions s JOIN _users u ON u.id=s.user_id WHERE s.hash=? AND s.expires>? AND u.active=1').get(digest(token),Date.now());return user?{email:String(user.email),userId:String(user.id),displayName:String(user.name),owner:!!user.owner}:null}
