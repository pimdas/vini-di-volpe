import type { Metadata } from 'next';
import './globals.css';
import Motion from './motion';
export const metadata: Metadata = {icons:{icon:[{url:'/volpe-favicon.png',type:'image/png',sizes:'32x32'}],apple:[{url:'/volpe-apple-icon.png',sizes:'180x180',type:'image/png'}]},title:'Vini di Volpe — Wijnproeverijen in Roermond',description:'Wijnproeverijen voor wijnvrienden in Roermond en omgeving. Bekijk de uitnodiging en meld je gezelschap aan.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nl"><body>{children}<Motion/></body></html>}
