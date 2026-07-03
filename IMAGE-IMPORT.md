# Automatisk bildimport från Wikimedia Commons

Version 4 innehåller ett komplett, webbaserat arbetsflöde för de 334 verifierade produkterna. Importen körs i GitHub Actions och kräver ingen lokal installation.

## Säkerhetsprincip

- Endast filer som faktiskt ligger på Wikimedia Commons används.
- Tillåtna licenser är CC0, public domain, CC BY och CC BY-SA.
- NC- och ND-licenser stoppas automatiskt.
- Fotograf, Commons-sida, licens och licenslänk sparas i manifestet.
- Standardläget är `review`: en importerad bild visas inte i shoppen förrän den godkänts.
- Om ingen rimlig och tillåten träff finns behåller produkten sin placeholder.

Automatisk licensfiltrering minskar risken men ersätter inte en mänsklig slutkontroll. Kontrollera alltid filens Commons-sida innan godkännande.

## Rekommenderad första körning: 30 produkter

1. Öppna repositoryt på GitHub.
2. Välj **Actions**.
3. Öppna **Import product images from Wikimedia Commons**.
4. Klicka **Run workflow**.
5. Välj:
   - `scope`: `sample`
   - `limit`: `30`
   - `approval_mode`: `review`
   - `overwrite`: av
6. Klicka på den gröna **Run workflow**-knappen.
7. Vänta tills både import och deploy är gröna.
8. Öppna webbplatsens `/bildgranskning`.

Urvalet för `sample` sprids över båda spellägena och flera kategorier.

## Godkänna bilder

På `/bildgranskning` visas produkt, föreslagen bild, träffsäkerhet, fotograf, licens, Commons-länk och alternativa träffar.

### Godkänn utvalda bilder

1. Kopiera de produkt-id:n du har granskat.
2. Gå till **Actions → Review imported product images**.
3. Välj `approve-ids`.
4. Klistra in id:n i `product_ids`, kommaseparerade.
5. Kör workflowet.

### Godkänn alla väntande bilder

Använd `approve-all` först när du visuellt har kontrollerat hela väntelistan.

### Avvisa eller börja om

- `reject-ids`: behåller filen men visar den inte.
- `reset-ids`: tar bort bildfil och metadata så produkten kan importeras på nytt.

## Importera samtliga 334 produkter

När testomgången ser bra ut:

1. Kör **Import product images from Wikimedia Commons** igen.
2. Välj `scope: all`.
3. Ange `limit: 0`.
4. Behåll `approval_mode: review`.

Importeraren hoppar automatiskt över produkter som redan har en godkänd eller väntande bild. Körningen kan därför återupptas säkert.

## Manuella undantag

Redigera `data/image-overrides.json` när en produkt behöver hjälp:

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
- `commonsTitle`: väljer en exakt Commons-fil.
- `skip`: hoppar över produkten.

Kör därefter importen med `overwrite: true` för de berörda produkterna. Vid en större batch kan övriga befintliga bilder ligga kvar eftersom redan importerade produkter hoppas över.

## Filer som skapas

- `public/product-images/<productId>.webp`
- `public/data/image-manifest.json`
- `public/data/image-review.json`
- `public/data/image-import-report.json`

Godkända bilder visas automatiskt i produktkort och produktdetaljer. Bildkällor listas automatiskt på `/bildkallor`.

## Poäng och träffsäkerhet

Importeraren väger bland annat in:

- överensstämmelse mellan filnamn och produktnamn,
- varumärke och modellord,
- bildstorlek och proportioner,
- beskrivande metadata,
- negativa ord som `logo`, `diagram`, `manual` och `brochure`.

Poängen är ett hjälpmedel, inte ett bevis på att bilden är rätt. Produkter med liknande modellnamn, samlarkort, klockreferenser och årsmodeller behöver extra noggrann kontroll.

## Lokala kommandon

```bash
npm run catalog:generate
npm run images:import -- --scope=sample --limit=30 --approval-mode=review
npm run images:review -- --action=approve-ids --ids="lux-000001,everyday-000001"
npm run images:validate
```

Lokal import kräver nätåtkomst och ImageMagick. GitHub-workflowet installerar ImageMagick automatiskt.
