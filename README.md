# Vini di Volpe

Website voor de wijnproeverijen van Vini di Volpe in Roermond en omgeving. De broncode van de huidige Sites-website staat in deze repository.

## Functionaliteit

- Homepage met proeverijthema, beschrijving en beschikbare edities.
- Aanmelden op een aparte pagina: hoofdboeker, e-mail, telefoon en aantal personen.
- Capaciteitsbewaking, bescherming tegen dubbele aanmeldingen en herhaalde verzendingen.
- Eén open ING- of Tikkie-betaalverzoek per editie; de bezoeker vult het getoonde bedrag zelf in.
- Beheer van proeverijen, edities, betaalverzoeken en ontvangen betalingen.
- Aanmeldingen met bezetting en vrije plaatsen per editie; automatische vernieuwing elke 20 seconden.
- Adressenlijst met bestaande en nieuwe hoofdboekers, ontdubbeld op e-mailadres.
- Excel (.xlsx), CSV en TSV import met kolomkeuze, voorbeeld en validatie.
- Uitnodigingsvinkjes en kopiëren van e-mailadressen voor het BCC-veld.

Er is nog geen automatische mailkoppeling of bankkoppeling. Betalingen worden handmatig afgevinkt.

## Techniek

React en Vinext, gebouwd met Vite voor een Cloudflare Worker. D1 slaat proeverijen, edities, boekingen en importcontacten op. De bestaande Sites-configuratie staat in `.openai/hosting.json`.

## Lokaal starten

Vereist Node.js 22.13 of nieuwer en npm.

```sh
npm ci
npm run build
```

Maak een lokale, niet ingecheckte `.dev.vars` met alleen de instellingen die je zelf nodig hebt:

```dotenv
ADMIN_EMAILS="seedy@sites.test"
```

Pas vervolgens de SQL-bestanden uit `drizzle/` op volgorde toe op de lokale database. Voor elk nog niet toegepast bestand:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_rainy_ricochet.sql
```

Herhaal dit voor de overige migraties; voer een al toegepaste migratie niet opnieuw uit.

```sh
npm run dev
```

De ondersteunde lokale Sites-testlogin staat op `/signin-with-chatgpt?return_to=/beheer`. Voor de gebouwde Worker is `npm start` beschikbaar. De lokale testlogin is onderdeel van de ontwikkelomgeving.

## Controles

```sh
npx tsc --noEmit
npm run build
```

## Hosting en gegevens

De huidige live website blijft via Sites gepubliceerd. Pushen naar deze GitHub-repository publiceert de website niet automatisch. Productie-instellingen, waaronder `ADMIN_EMAILS`, worden in de serveromgeving ingesteld.

Deze repository bevat uitsluitend broncode, afbeeldingen en schemamigraties. Er staan geen deelnemerslijsten, databasebestanden, wachtwoorden, tokens of lokale omgevingsinstellingen in. De bestaande productiegegevens worden niet naar GitHub gekopieerd.

Nieuwe migraties worden toegevoegd; reeds toegepaste migraties blijven ongewijzigd. De beheeromgeving controleert de ingelogde gebruiker op de server. Fotovermeldingen staan onder Beeldcredits op de website; meegeleverde licenties blijven behouden.
