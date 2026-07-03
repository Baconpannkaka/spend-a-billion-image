# Spend a Billion v4 Images

Ett statiskt fantasishopping-spel byggt med Next.js, React, TypeScript och Tailwind CSS. Användaren väljer shoppingläge, budget och valuta, fyller en fantasivarukorg och delar ett skrivskyddat resultat.

- **Miljardärsläge:** privatjet, superbilar, yachter, klockor, konst, fastigheter, PSA-graderade samlarkort och extrema upplevelser.
- **Vardagsläge:** mobiler, datorer, spel, mat, hem, kläder, barn, fritid, husdjur, resor och andra igenkännbara köp.

Ingen databas, autentisering eller riktig betalning används.

## Nytt i v4

- Automatisk Wikimedia Commons-import för de 334 verifierade produkterna.
- GitHub Action som söker, hämtar, komprimerar och döper bilder efter produkt-id.
- Automatisk filtrering av licenser: CC0, public domain, CC BY och CC BY-SA.
- NC- och ND-licenser stoppas.
- Fotograf, källa, licens, Commons-fil och kontrollstatus sparas centralt.
- En intern granskningssida på `/bildgranskning`.
- Ett separat workflow för att godkänna, avvisa eller återställa bilder.
- WebP-bilder med maxdimension 1600 × 1200 via ImageMagick i GitHub Actions.
- Importen kan återupptas utan att redan klara bilder laddas ned igen.
- Manuella sök- och filundantag via `data/image-overrides.json`.

Läs [IMAGE-IMPORT.md](IMAGE-IMPORT.md) för det kompletta arbetsflödet.

## GitHub Pages

Använd ett nytt tomt repository för denna version.

1. Packa upp zip-filen.
2. Ladda upp allt **inuti** projektmappen direkt till repositoryts rot.
3. Kontrollera att `.github`, `package.json`, `package-lock.json`, `src`, `scripts` och `public` syns direkt under **Code**.
4. Välj **Settings → Pages → GitHub Actions**.
5. Följ **Build and deploy Spend a Billion** under Actions.

När sidan fungerar kör du bildimporten enligt [IMAGE-IMPORT.md](IMAGE-IMPORT.md). Börja med 30 produkter i `review`-läge.

## Installera lokalt

```bash
npm ci
npm run dev
```

## Kontroller

```bash
npm run verify
npm run build
```

`verify` genererar och validerar katalogerna, validerar bildmanifest och granskningskö, kör lint, TypeScript och tester.

## Bildkommandon

```bash
npm run images:import -- --scope=sample --limit=30 --approval-mode=review
npm run images:review -- --action=approve-ids --ids="lux-000001,everyday-000001"
npm run images:validate
```

GitHub-versionen är den rekommenderade vägen eftersom den installerar bildkonverteraren automatiskt och sparar resultatet i repositoryt.

## Produktkataloger

Varje shoppingläge innehåller exakt 10 000 poster och laddas som separat JSON. Den verifierade kärnan består av:

- 129 verkliga modeller i Miljardärsläget.
- 205 verkliga modeller i Vardagsläget.
- 9 kurerade fantasierbjudanden.
- Tydligt märkta genererade reservposter för återstående katalogplatser.

Katalogerna skapas av `scripts/generate-catalogs.mjs`. Verkliga produkter finns i `scripts/real-product-seeds.mjs`.

## Bildstruktur

- Bildfiler: `public/product-images/<productId>.webp`
- Publicerade bilder: `public/data/image-manifest.json`
- Granskningskö: `public/data/image-review.json`
- Senaste rapport: `public/data/image-import-report.json`
- Manuella undantag: `data/image-overrides.json`

Endast status `approved` visas i shoppen. Alla andra produkter använder placeholders.

## Språk och produktnamn

Officiella modellnamn översätts inte. Generiska produkt- och erbjudandenamn kan ha separata lokaliseringar. Gränssnittet stöder svenska, engelska, spanska, mandarin, hindi och arabiska, med svensk fallback där full översättning saknas.

## Reklam

Annonsytor är förberedda men avstängda. Inga trackers laddas. Läs [AD-INTEGRATION.md](AD-INTEGRATION.md) innan en annonsleverantör kopplas in.

## Begränsningar

- Automatisk bildmatchning kan välja fel årsmodell, vinkel eller variant och måste granskas.
- Alla 334 verifierade produkter har inte nödvändigtvis en lämplig Commons-bild.
- En fri bildlicens innebär inte automatiskt att alla andra rättigheter, exempelvis person- eller varumärkesfrågor, är lösta för varje användning.
- Produktpriser är ungefärliga spelvärden och inte aktuella offerter.
- Fullständig produktöversättning och ersättning av samtliga genererade reservposter återstår.

## Juridiskt

Sidan säljer ingenting och är inte ansluten till personerna eller varumärkena som nämns. Varje godkänd extern bild ska ha korrekt fotograf, källa och licens. Kontrollera alltid respektive Commons-fils villkor före publicering.
