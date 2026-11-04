import {getAdmin,SESSION_COOKIE,digest} from '../../../../lib/admin-auth';
import {cookies} from 'next/headers';
import {sqlite} from '../../../../lib/runtime';
export async function POST(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Geen toegang',{status:403});if(await getAdmin()){const token=(await cookies()).get(SESSION_COOKIE)?.value;if(token)sqlite().prepare('DELETE FROM _sessions WHERE hash=?').run(digest(token))}return new Response(null,{status:303,headers:{Location:'/beheer','Set-Cookie':`${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`,'Cache-Control':'no-store'}})}
