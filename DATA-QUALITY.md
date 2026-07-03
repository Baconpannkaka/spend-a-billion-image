# Datakvalitet och produktkatalog

## Tre kvalitetsnivåer

Varje produkt har ett explicit `dataQuality`-fält:

- `verified` – ett verkligt produktnamn eller en verklig modell med minst en extern produkt- eller tillverkarkälla.
- `curated` – ett manuellt formulerat fantasierbjudande, exempelvis en takvåning eller privat ö.
- `generated` – en tydligt märkt katalogvariation som håller katalogen bred tills den ersätts av bättre data.

`verified` betyder inte att priset är en aktuell offert. Prisets karaktär anges separat med `priceType`:

- `official-retail` – ungefärligt list- eller konsumentpris.
- `market-estimate` – uppskattat andrahands- eller samlarvärde.
- `fantasy-estimate` – underhållningsvärde för ett fantasierbjudande.

## Nuvarande katalogstatus

Kataloggeneratorn skapar exakt 10 000 poster per spelläge:

| Läge | Verkliga namn/modeller | Kurerade fantasierbjudanden | Genererade reservposter |
|---|---:|---:|---:|
| Miljardärsläge | 129 | 9 | 9 862 |
| Vardagsläge | 205 | 0 | 9 795 |
| **Totalt** | **334** | **9** | **19 657** |

Verkliga och kurerade poster prioriteras i standardsorteringen. Reservposterna använder inga påhittade varumärken och är tydligt formulerade som fantasival.

## Språkregler

Produktnamn klassas som antingen:

- `official` – varumärke och officiellt modellnamn bevaras på originalspråk, till exempel `Audemars Piguet Royal Oak Concept Flying Tourbillon`.
- `translatable` – generiska erbjudanden får lokaliserade namn, till exempel `Takvåning i Monaco` / `Monaco penthouse`.

Beskrivningar, fakta, kategori och underkategori kan lokaliseras separat utan att modellnamnet förändras.

## Stabilitet

- Produkt-id:n är permanenta och används av varukorg, delning och framtida bilder.
- Katalogvalideringen stoppar dubletter bland verifierade produkter, ogiltiga priser, saknade källor och felaktig språkmetadata.
- Produktkällor är externa referenser. De ska granskas vid större datakörningar och kan behöva uppdateras när tillverkare flyttar sidor.
- Priser bör datumstämplas och uppdateras periodiskt. De får aldrig presenteras som bindande offerter.

## Så ersätts en reservpost

1. Lägg den verkliga produkten i `scripts/real-product-seeds.mjs`.
2. Ange namn, varumärke, kategori, underkategori, SEK-pris, källa och pristyp.
3. Kör `npm run catalog:generate`.
4. Kör `npm run verify`.
5. Kontrollera att produktens permanenta id inte används av en tidigare publicerad verklig produkt innan publicering.

## Kvarvarande datarbete

- Ersätta fler reservposter med verkliga produkter och modeller.
- Verifiera prisnivåer mot flera källor där marknaden är volatil.
- Förbättra underkategori- och språktexter för varje verklig produkt.
- Lägga in godkända produktbilder och licensmetadata.
- Skapa ett återkommande granskningsflöde för utgångna modeller, prisförändringar och brutna länkar.

## Bildkvalitet i v4

Bilddata hålls separat från produktkatalogen. Wikimedia-importeraren behandlar endast `verified`-produkter och sparar vald fil, fotograf, licens, källa, matchningspoäng och granskningsstatus.

- `unreviewed`: importerad men visas inte i shoppen.
- `approved`: manuellt eller uttryckligen godkänd och får visas.
- `rejected`: avvisad kandidat som inte visas.
- `placeholder`: ingen extern produktbild används.

Granskningskön skiljer på `pending`, `no-match`, `error`, `approved` och `rejected`. En teknisk felnivå över 25 procent gör att importworkflowet misslyckas i stället för att spara en missvisande körning.

Automatisk träffpoäng baseras på produktnamn, varumärke, bildmetadata, upplösning och negativa signaler som logotyper och manualer. Poängen är bara ett prioriteringsverktyg. Rätt årsmodell, referens, språkversion och produktvariant måste fortfarande kontrolleras visuellt.
