# Vini di Volpe — Railway

Wijnproeverijen met homepage, aanmeldingen, editiebeheer, handmatig afvinken van betalingen en een adressenlijst met Excel-import.

## Railway

Deze versie draait als een gewone Node.js-server. `npm run build` maakt de Vinext standalone-build; `npm start` luistert op `0.0.0.0` en de door Railway verstrekte `PORT` (standaard 8080). Het domein gebruikt dezelfde poort.

- Node.js 22.13 of nieuwer.
- Een Railway-volume op `/data`.
- `DATABASE_PATH=/data/vini.sqlite`.
- `ADMIN_EMAILS`: e-mailadres van de beheerder.
- `ADMIN_SETUP_TOKEN`: een lange willekeurige eenmalige instelcode.
- Healthcheck: `/api/health`.

`railway.json` bevat de build-, start- en healthcheckinstellingen. De SQLite-database staat op het volume, buiten de tijdelijke container. De SQL-bestanden in `drizzle/` worden automatisch op volgorde toegepast; wijzigingen aan al toegepaste migraties geven een fout in plaats van stilzwijgend dataverlies. Eén replica is geschikt voor deze lokale SQLite-opslag. Het volume is blijvende opslag, geen vervanging voor een backup.

## Beheer activeren

Open `/beheer`. Voer de eenmalige code uit Railway Variables (`ADMIN_SETUP_TOKEN`) in en kies zelf een wachtwoord van minimaal 12 tekens. Na het instellen wordt de code niet meer geaccepteerd. Het wachtwoord wordt met scrypt gehasht opgeslagen. Inlogsessies verlopen na acht uur en gebruiken een HttpOnly-cookie (Secure via HTTPS). De login heeft een limiet op mislukte pogingen. De oude Sites-inlogheaders geven geen beheerrechten op Railway.

## Lokale ontwikkeling

```sh
npm ci
npm run dev
```

Stel de variabelen uit `.env.example` in; gebruik lokaal bijvoorbeeld `DATABASE_PATH=.data/vini.sqlite`. De database en eventuele `.env`-bestanden horen niet in Git.

```sh
npx tsc --noEmit
npm run build
PORT=8080 npm start
```

## Gegevens en Sites

De gegevens van de bestaande Sites-publicatie worden niet automatisch meegemigreerd. Railway begint met een eigen lege database. De bestaande Sites-website en haar deelnemersgegevens blijven behouden. Laat inschrijvingen pas via de nieuwe website lopen nadat de proeverijen, edities, betaallinks en eventuele bestaande boekingen zijn overgezet en gecontroleerd.

Er is nog geen automatische mail- of bankkoppeling. Het wijzigen van een betaalstatus verstuurt geen mail. Voor uitnodigingen kopieert de adressenlijst e-mailadressen naar het BCC-veld.

Fotovermeldingen staan onder Beeldcredits op de website. Meegeleverde licenties zijn behouden.
