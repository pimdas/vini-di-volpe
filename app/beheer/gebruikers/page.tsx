import {redirect} from 'next/navigation';
import {getAdmin} from '../../../lib/admin-auth';
import {sqlite} from '../../../lib/runtime';
import Brand from '../../brand';
import Users from './users';
import '../beheer.css';
export const dynamic='force-dynamic';
export const metadata={title:'Gebruikers — Vini di Volpe',robots:{index:false,follow:false}};
export default async function UserPage(){const admin=await getAdmin();if(!admin)redirect('/beheer');const users=admin.owner?sqlite().prepare('SELECT id,name,email,owner,active FROM _users ORDER BY owner DESC,name,email').all().map(u=>({...u,id:String(u.id),name:String(u.name),email:String(u.email),owner:!!u.owner,active:!!u.active})):[];return <main className="admin-access users-page"><Brand/><p><a href="/beheer"><svg className="ui-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M20 12H4m7-7-7 7 7 7"/></svg> Terug naar beheer</a></p><h1>{admin.owner?'Gebruikers':'Mijn account'}</h1><p>Ingelogd als {admin.email}. {admin.owner?'Andere gebruikers kunnen proeverijen, aanmeldingen en de adressenlijst beheren. Alleen jij kunt accounts beheren.':''}</p><Users initial={users} owner={admin.owner}/></main>}
