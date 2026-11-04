import RegistrationForm from './registration-form';
import {getOpenEditions} from '../../lib/editions';
import type {Edition} from '../../lib/registration';
export const dynamic='force-dynamic';
export const metadata={title:'Aanmelden — Vini di Volpe'};
export default async function Aanmelden({searchParams}:{searchParams?:Promise<{editie?:string}>}){
 const requested=(await searchParams)?.editie;
 let editions:Edition[]=[];let unavailable=false;
 try{editions=await getOpenEditions()}catch{unavailable=true}
 return <><header><a className="brand" href="/">Vini di Volpe<span>Wijnvrienden in Roermond & omgeving</span></a><nav aria-label="Hoofdnavigatie"><a href="/#proeverij">Proeverij</a><a href="/#terugblik">Terugblik</a><a href="/aanmelden" aria-current="page">Aanmelden</a></nav></header><main className="booking-page"><aside className="booking-story"><h1>Jouw plek<br/> aan tafel</h1><p className="lead">Meld je gezelschap aan voor één editie. Jij bent de hoofdboeker en ons aanspreekpunt.</p><details className="booking-explain"><summary>Over de proeverijen</summary><p><strong>Twee proeverijen per jaar</strong></p><p>Elke proeverij heeft een eigen thema. Je kiest uit twee of drie edities, meestal binnen één à twee weken.</p><p>Je hoeft alleen de gegevens van de hoofdboeker in te vullen. Het aantal personen is inclusief jezelf.</p></details><img src="/glass.jpg" width="2728" height="1816" alt="Een glas witte wijn tussen de wijnranken"/></aside><div className="booking-form-side"><RegistrationForm editions={editions} unavailable={unavailable} initialEditionId={requested}/></div></main><footer className="booking-footer"><span>Vini di Volpe</span><a href="/#vragen">Goed om te weten</a><a href="/privacy">Je gegevens</a></footer></>;
}
