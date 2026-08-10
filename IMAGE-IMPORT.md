# Bildsök v3 – automatisk produktbildimport

Bildimporten körs helt via GitHub Actions och adminsidan `/bildgranskning`. Ingen lokal installation behövs för normal användning.

## Källor och säkerhetsprincip

Bildsök v3 använder två öppna bildkällor:

1. **Wikimedia Commons** är förstahandskälla.
2. **Openverse** används som extra söktjänst när Commons inte ger en tillräckligt bra kandidat. Openverse-resultat från Wikimedia filtreras bort för att undvika dubbletter.

Tillåtna licenstyper är CC0/public domain, CC BY och CC BY-SA. NC- och ND-licenser stoppas. Fotograf, originalkälla, licens, licenslänk och vilken bildtjänst som hittade bilden sparas med posten.

Openverse indexerar licensinformation men garanterar inte att den är korrekt. Därför auto-godkänns **aldrig** Openverse-träffar; kontrollera originalkällan innan du godkänner dem.

## Smart läge

Adminsidan startar import med `approval_mode: smart`.

- En mycket säker, exakt Wikimedia Commons-träff kan auto-godkännas.
- Commons-träffar som inte når den hårda säkerhetsnivån hamnar i granskningskön.
- Alla Openverse-träffar hamnar i granskningskön.
- Nekade bilder sparas som feedback och samma källa/titel filtreras bort vid nästa försök.
- Produkter som redan fått `no-match` i aktuell sökversion pausas tills söklogiken uppgraderas igen.

## Rekommenderat arbetsflöde

1. Öppna webbplatsens `/bildgranskning`.
2. Välj 25, 50 eller 100 produkter och klicka **Gör ny inläsning**.
3. Följ **Live-status** tills import och publicering är klara.
4. Granska endast poster under **Väntar**.
5. Markera flera bilder och välj **Godkänn markerade** eller **Neka markerade**.
6. Klicka **Verkställ beslut** och följ live-statusen igen.
7. Kör nästa batch.

Du behöver normalt inte öppna GitHub Actions manuellt.

## Bildvisning

Godkända produktbilder visas med `object-contain` i stället för `object-cover`. Hela den importerade bilden får därför plats i produktkort och på produktsidan utan att webbplatsen beskär kanterna. Om själva originalfotot redan är beskuret kan gränssnittet naturligtvis inte återskapa det som saknas.

## Manuella undantag

`data/image-overrides.json` kan fortfarande användas för svåra produkter:

```json
{
  "lux-000001": {
    "query": "Bugatti Tourbillon production car"
  },
  "everyday-000042": {
    "commonsTitle": "File:Exact Wikimedia filename.jpg"
  },
  "lux-000099": {
    "skip": true
  }
}
```

- `query`: ersätter den automatiska sökfrasen.
- `commonsTitle`: tvingar en specifik Commons-fil.
- `skip`: hoppar över produkten.

## Filer som skapas

- `public/product-images/<productId>.webp`
- `public/data/image-manifest.json`
- `public/data/image-review.json`
- `public/data/image-import-report.json`
- `data/image-feedback.json` uppdateras när bilder godkänns eller nekas.

Godkända bildkällor listas automatiskt på `/bildkallor`.

## Diagnostik

Varje import rapporterar bland annat:

- exakt antal verifierade produkter i valt scope,
- hur många produkter som valdes,
- träff/no-match/fel,
- hur många som auto-godkändes,
- antal sökningar och valda bilder per källa,
- tidigare nekade kandidater som filtrerades bort,
- eventuella dubbla verifierade produkt-id:n.

Det gör att katalog- och bildköstatistik kan jämföras utan manuella gissningar.

## Lokala kommandon för utveckling

```bash
npm run catalog:generate
npm run images:import -- --scope=sample --limit=30 --approval-mode=smart
npm run images:review -- --action=approve-ids --ids="lux-000001,everyday-000001"
npm run images:validate
```

Lokal import kräver nätåtkomst och ImageMagick. GitHub-workflowet installerar ImageMagick automatiskt.
