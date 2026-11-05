import {redirect} from 'next/navigation';
import {getAdmin} from '../../../lib/admin-auth';
import {adminData} from '../../../lib/admin-data';
import Brand from '../../brand';
import Mail from './mail';
import '../beheer.css';
export const dynamic='force-dynamic';
export const metadata={title:'E-mail — Vini di Volpe',robots:{index:false,follow:false}};
export default async function MailPage(){const admin=await getAdmin();if(!admin)redirect('/beheer');const data=await adminData();return <main className="admin-access mail-page"><Brand/><p><a href="/beheer">← Terug naar beheer</a></p><h1>E-mail</h1><Mail contacts={data.contacts.filter(c=>c.invite)} rounds={data.rounds} email={admin.email} bookings={data.bookings}/></main>}
