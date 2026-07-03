# Reklamintegration

Projektet innehåller färdiga, responsiva annonsplatser men laddar inga annonser, trackers eller tredjepartsskript som standard.

## Förberedda placeringar

Konfigurationen finns i `src/config/ads.ts`:

- `home-banner` – bred yta på startsidan.
- `shop-rail` – sidokolumn på breda skärmar.
- `shop-inline` – yta mellan produktsektioner.
- `result-rail` – diskret yta på resultatsidan.

Komponenterna reserverar inte tomt utrymme när annonser är avstängda. Därför påverkas inte nuvarande layout.

## Koppla in AdSense senare

1. Publicera sajten på en permanent domän och färdigställ juridik, kontaktväg och integritetstext.
2. Ansök om ett annonskonto och invänta godkännande.
3. Lägg in det riktiga `ca-pub-...`-värdet och slot-id:n i `src/config/ads.ts`.
4. Kopiera `public/ads.txt.example` till `public/ads.txt` och ersätt platshållaren.
5. Inför en godkänd samtyckeslösning innan annonser som kräver samtycke aktiveras för berörda regioner.
6. Testa mobil, surfplatta och desktop så att annonser inte döljer köpknappar eller kan förväxlas med produkter.
7. Sätt `enabled: true` först när allt ovan är färdigt.

## Produktregel

Annonsytor ska alltid:

- vara märkta som annons,
- vara visuellt separerade från produktkort och navigering,
- inte efterlikna knappar eller spelresultat,
- inte orsaka layoutskiften,
- inte visas i kassans kritiska knappområde.

## Vad som inte ingår ännu

- aktivt annonskonto eller publisher-id,
- samtyckesplattform/CMP,
- cookie- eller integritetshantering för en verklig annonsleverantör,
- intäktsanalys,
- A/B-testning av placeringar.

Detta ska göras först när den publika sajten, domänen och juridiken är klara.
