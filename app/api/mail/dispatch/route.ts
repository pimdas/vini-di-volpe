import {timingSafeEqual} from 'node:crypto';
import {digest} from '../../../../lib/admin-auth';
import {dispatchMail} from '../../../../lib/mail';
export const dynamic='force-dynamic';
export async function POST(request:Request){const expected=process.env.INTERNAL_MAIL_TOKEN;if(!expected||!timingSafeEqual(Buffer.from(digest(request.headers.get('authorization')||'')),Buffer.from(digest(`Bearer ${expected}`))))return new Response(null,{status:403});return Response.json(await dispatchMail(),{headers:{'Cache-Control':'no-store'}})}
