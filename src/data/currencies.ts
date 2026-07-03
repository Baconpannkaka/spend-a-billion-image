import type { CurrencyCode } from "@/types";

export type Currency = {
  code: CurrencyCode;
  name: string;
  shortName: string;
  unitsPerSek: number;
};

// ECB reference rates from 30 June 2026, normalized to currency units per SEK.
export const currencies: Currency[] = [
  { code: "SEK", name: "Svenska kronor", shortName: "SEK", unitsPerSek: 1 },
  { code: "USD", name: "Amerikanska dollar", shortName: "USD", unitsPerSek: 1.1394 / 11.0935 },
  { code: "EUR", name: "Euro", shortName: "EUR", unitsPerSek: 1 / 11.0935 },
  { code: "GBP", name: "Brittiska pund", shortName: "GBP", unitsPerSek: 0.86178 / 11.0935 },
  { code: "NOK", name: "Norska kronor", shortName: "NOK", unitsPerSek: 11.3105 / 11.0935 },
  { code: "DKK", name: "Danska kronor", shortName: "DKK", unitsPerSek: 7.4744 / 11.0935 },
  { code: "CHF", name: "Schweiziska franc", shortName: "CHF", unitsPerSek: 0.9224 / 11.0935 },
  { code: "JPY", name: "Japanska yen", shortName: "JPY", unitsPerSek: 185.08 / 11.0935 },
  { code: "CAD", name: "Kanadensiska dollar", shortName: "CAD", unitsPerSek: 1.622 / 11.0935 },
  { code: "AUD", name: "Australiska dollar", shortName: "AUD", unitsPerSek: 1.6544 / 11.0935 },
];

export const currencyByCode = new Map(currencies.map((currency) => [currency.code, currency]));

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && currencyByCode.has(value as CurrencyCode);
}

export function sekToCurrency(valueSek: number, currency: CurrencyCode): number {
  return valueSek * (currencyByCode.get(currency)?.unitsPerSek ?? 1);
}

export function currencyToSek(value: number, currency: CurrencyCode): number {
  const rate = currencyByCode.get(currency)?.unitsPerSek ?? 1;
  return value / rate;
}
