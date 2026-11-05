# Brevo aansluiten op Vini di Volpe

De website kan bevestigingen en uitnodigingen versturen via een gratis Brevo-account. Zolang de onderstaande instellingen ontbreken, wordt geen mail verstuurd.

1. Maak bij Brevo een gratis account aan en rond eventuele accountcontrole af.
2. Kies een afzenderadres, bijvoorbeeld proeverij@vini-di-volpe.nl. Stel bij STRATO desgewenst doorsturen in naar je bestaande mailbox. Doorsturen ontvangt mail; Brevo verstuurt mail vanuit de website.
3. Voeg het domein vini-di-volpe.nl toe bij Brevo. Neem de DNS-records die Brevo voor dit domein toont exact over bij STRATO. Gebruik geen voorbeeldwaarden. Laat de bestaande website- en mailrecords staan. Wacht op de melding dat de verificatie is geslaagd.
4. Maak een API-sleutel voor de Brevo e-mail-API aan. Gebruik geen SMTP-wachtwoord. Plak de sleutel uitsluitend in Railway, niet in chat, broncode of dit document.
5. Zet bij de Railway-service deze variabelen:

| Variabele | Waarde |
|---|---|
| BREVO_API_KEY | Jouw geheime Brevo API-sleutel |
| MAIL_FROM_EMAIL | Het geverifieerde afzenderadres |
| MAIL_REPLY_TO | Adres waarop je reacties wilt ontvangen |
| PUBLIC_SITE_URL | https://vini-di-volpe-production.up.railway.app |

Gebruik voor PUBLIC_SITE_URL later de eigen domeinnaam zodra die op deze website is aangesloten. Sla de variabelen op en laat Railway opnieuw publiceren.

6. Open Beheer → E-mail. Kies een proeverij met open edities, schrijf de uitnodiging en controleer de ontvangers. Maak een voorbeeld en verstuur eerst een testmail. De test gaat alleen naar het e-mailadres van de ingelogde beheerder. Controleer de ontvangen mail en spammap voordat je op de verzendknop voor alle geselecteerde ontvangers klikt.

Nieuwe aanmeldingen krijgen na aansluiting automatisch een bevestiging met boekingsreferentie, editie, aantal personen, totaalbedrag en de actuele betaalpagina. De mail is een ontvangstbevestiging; betaling wordt nog steeds handmatig gecontroleerd.

Onder E-mail vind je concepten, de wachtrij en verzendstatussen. ‘Door Brevo geaccepteerd’ betekent niet automatisch bezorgd. Controleer bezorging, blokkades en bounces in Brevo. Bij onzekere verzending wordt niet automatisch opnieuw verstuurd. Zeker mislukte mails kun je na herstel opnieuw proberen. Stoppen slaat nog wachtende uitnodigingen over; een mail die al onderweg is kan niet worden teruggehaald.

Uitnodigingen bevatten een persoonlijke afmeldlink. De afmeldpagina vraagt een bevestiging, zodat een automatische linkcontrole niet meteen afmeldt. Na afmelden wordt de ontvanger overgeslagen voor uitnodigingen, ook als deze al in de wachtrij staat. Bevestigingen van boekingen blijven mogelijk.

De app verwerkt maximaal 280 geaccepteerde/onzekere mails per UTC-dag en stopt met uitnodigingen bij 255, zodat er ruimte voor bevestigingen overblijft. Eventuele andere verzendingen in hetzelfde Brevo-account tellen daar ook mee voor Brevo; bij een limietmelding wacht de app en probeert later opnieuw.

Er zijn alleen lokale tests met een nagebootste Brevo-dienst uitgevoerd. Een echte testmail kan pas na account- en domeinverificatie.
