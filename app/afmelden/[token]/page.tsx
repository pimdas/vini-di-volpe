import Brand from '../../brand';
import {sqlite} from '../../../lib/runtime';
export const dynamic='force-dynamic';
export const metadata={title:'Afmelden — Vini di Volpe',robots:{index:false,follow:false}};
export default async function Unsubscribe({params}:{params:Promise<{token:string}>}){const {token}=await params;const known=/^[a-f0-9]{64}$/.test(token)&&sqlite().prepare('SELECT token FROM mail_unsubscribes WHERE token=?').get(token);return <main className="privacy-page"><Brand/><h1>Uitnodigingen afmelden</h1>{known?<><p>Wil je geen uitnodigingen voor nieuwe proeverijen meer ontvangen? Bevestig hieronder je afmelding. Berichten over een bestaande aanmelding blijf je ontvangen.</p><form method="post" action="/api/mail/afmelden"><input type="hidden" name="token" value={token}/><button type="submit">Geen uitnodigingen meer ontvangen</button></form></>:<p>Deze afmeldlink is niet geldig. Neem contact op met de organisatie.</p>}</main>}
