import {getAdmin} from '../../lib/admin-auth';
import {hasAdmin} from '../../lib/admin-auth';
import Login from './login';
import {adminData} from '../../lib/admin-data';
import Admin from './admin';
import './beheer.css';
export const dynamic='force-dynamic';
export const metadata={title:'Beheer — Vini di Volpe',robots:{index:false,follow:false}};
export default async function Beheer({searchParams}:{searchParams:Promise<{tab?:string}>}){const admin=await getAdmin();if(!admin)return <Login setup={!hasAdmin()}/>;
 const params=await searchParams;const initialView=params.tab==='adressenlijst'?'contacts':params.tab==='edities'?'editions':(params.tab==='proeverijen'||params.tab==='ronden')?'rounds':'bookings';
 try{return <Admin initial={await adminData()} email={admin.email} initialView={initialView}/>}catch{return <main className="admin-access"><h1>Beheer</h1><p>Het overzicht kan nu niet worden geladen. Probeer de pagina opnieuw.</p><a href="/beheer">Opnieuw laden</a></main>}}
