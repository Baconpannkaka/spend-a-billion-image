# Kvarvarande arbete efter v4

## Före bred användartestning

1. Kör en provimport av 30 produkter.
2. Granska precisionen per kategori.
3. Justera felaktiga sökningar i `data/image-overrides.json`.
4. Importera återstående verifierade produkter.
5. Godkänn bara bilder som visar rätt produkt och har tydlig licensinformation.

## Produktdata

- Ersätt fler genererade reservposter med verkliga produkter.
- Gör en separat prisrevision med marknad och datum per produkt.
- Lägg till fler riktiga produkter i kategorier som har låg representation.
- Förbättra produktbeskrivningar och fakta för den verifierade kärnan.

## Språk

- Full översättning av beskrivningar, fakta och underkategorier.
- Språklig kvalitetskontroll av arabiska, hindi och mandarin.
- Lokaliserade pris- och måttenhetsförklaringar.

## Bilder

- Manuellt lösa `no-match` och låg träffsäkerhet.
- Kontrollera personrättigheter där identifierbara personer förekommer.
- Byta ut bilder som visar fel årsmodell, referens eller produktvariant.
- Eventuellt stöd för fler öppna bildkällor efter separat juridisk granskning.

## Lansering och intäkter

- Egen domän.
- Slutlig integritets- och cookieinformation.
- CMP/samtyckeslösning där det krävs.
- Annonskonto, publisher-id och aktivering av förberedda annonsytor.
- Integritetsvänlig statistik efter samtyckesbedömning.
