import type { Metadata } from 'next';
import './globals.css';
import Motion from './motion';
export const metadata: Metadata = {title:'Vini di Volpe — Wijnproeverijen in Roermond',description:'Wijnproeverijen voor wijnvrienden in Roermond en omgeving. Bekijk de uitnodiging en meld je gezelschap aan.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nl"><body>{children}<Motion/></body></html>}
