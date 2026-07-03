# AGENTS.md

## Produktregler

- Sidan är alltid ett fantasishopping-spel. Ingen riktig betalning eller beställning får införas.
- Budgeten får aldrig överskridas.
- Delade resultat är skrivskyddade.
- En utmaning återanvänder spelläge, valuta och budget men inte originalets varukorg.
- Alla priser lagras i SEK och visas i användarens valda valuta.
- Lyx- och vardagskatalogen ska vardera innehålla exakt 10 000 produkter.
- Produkt-id:n får aldrig återanvändas för en annan publicerad produkt.
- Officiella varumärkes- och modellnamn ska inte översättas. Generiska erbjudanden ska använda lokaliseringsfält.
- Reklam ska vara avstängd tills publisher-id, juridik och samtyckeslösning är klara.

## Bildregler

- Endast bildstatus `approved` får visas i shoppen.
- Automatisk import ska som standard skapa status `unreviewed`.
- Tillåt endast CC0, public domain, CC BY och CC BY-SA.
- Stoppa NC, ND och otydliga licenser.
- Varje bild måste ha produkt-id, lokal sökväg, alt-text, Commons-källa, skapare och licens.
- Bilden ska faktiskt visa rätt produkt, inte bara varumärkets logotyp, manual, ritning eller närliggande modell.
- Automatiskt poängvärde är ett granskningsstöd, aldrig ett slutligt godkännande.
- Bilder ska döpas efter stabilt produkt-id och lagras under `public/product-images`.
- Radera inte licensmetadata när en bild konverteras eller beskärs; attributionen ska ligga kvar i manifestet.

## Produktkvalitet

- `verified`: verkligt produktnamn/modell med extern källa.
- `curated`: manuellt kurerat fantasierbjudande.
- `generated`: tydligt märkt reservpost.
- `official-retail`: ungefärligt list-/konsumentpris.
- `market-estimate`: uppskattat marknads- eller samlarvärde.
- `fantasy-estimate`: underhållningsvärde.

Standardsorteringen ska prioritera `verified`, därefter `curated`, därefter `generated`.

## Struktur

- `src/app`: statiska routes för GitHub Pages.
- `src/components`: återanvändbara UI- och flödeskomponenter.
- `src/context`: global spelstatus, språk och toast.
- `src/catalog`: asynkron katalog- och bildmanifestladdning.
- `src/lib`: budget, varukorg, sökning, format, delning, produkttext och achievements.
- `scripts/real-product-seeds.mjs`: verifierade produktfrön.
- `scripts/generate-catalogs.mjs`: genererar 20 000 produkter.
- `scripts/import-wikimedia-images.mjs`: söker, rankar, laddar ned och konverterar Commons-bilder.
- `scripts/review-images.mjs`: godkänner, avvisar eller återställer bildposter.
- `scripts/lib/wikimedia-images.mjs`: API-, licens- och matchningslogik.
- `data/image-overrides.json`: manuella sök- och filval.
- `public/product-images`: importerade WebP-filer.
- `public/data/image-manifest.json`: publiceringsmanifest.
- `public/data/image-review.json`: granskningskö.
- `IMAGE-IMPORT.md`: operativ guide.

## Kodprinciper

- TypeScript strict, inga `any`.
- Stora kataloger importeras inte i React-bundlen; de hämtas som JSON per spelläge.
- Lägg inte in 20 000 dynamiska routes. Produktsidan använder query-parametrar.
- All klientlagring och delningsdata ska valideras.
- Nya verkliga produkter ska ha källa, pristyp och granskningsdatum.
- Annonskomponenter får inte efterlikna produktkort eller orsaka layoutskiften.
- GitHub-workflows ska köra full verifiering och build innan genererade filer committas.
- Bildimporten ska vara återupptagningsbar och inte skriva över godkända bilder utan ett uttryckligt val.

## Kommandon

```bash
npm run catalog:generate
npm run catalog:validate
npm run images:import -- --scope=sample --limit=30 --approval-mode=review
npm run images:review -- --action=approve-ids --ids="lux-000001"
npm run images:validate
npm run lint
npm run typecheck
npm test
npm run verify
npm run build
```
