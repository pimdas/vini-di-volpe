import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
export async function getAdmin(){const user=await getChatGPTUser();if(!user)return null;const allowed=(env.ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);return allowed.includes(user.email.toLowerCase())?user:null}
