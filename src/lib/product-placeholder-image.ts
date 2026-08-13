import type { Product } from "@/types";

export const PLACEHOLDER_SPRITE_PATH = "/placeholders/placeholder-sprite.webp";
export const PLACEHOLDER_SPRITE_COLUMNS = 7;
export const PLACEHOLDER_SPRITE_ROWS = 4;

export type PlaceholderKey =
  | "art"
  | "baby"
  | "bike"
  | "books-media"
  | "camera"
  | "clothing"
  | "collectibles"
  | "cookware"
  | "experiences"
  | "food"
  | "furniture"
  | "game-console"
  | "handbag"
  | "headphones"
  | "jewelry"
  | "laptop"
  | "perfume"
  | "pets"
  | "private-jet"
  | "property"
  | "smartphone"
  | "sneakers"
  | "sunglasses"
  | "supercar"
  | "travel"
  | "watch"
  | "wellness"
  | "yacht";

export type PlaceholderSpritePosition = {
  key: PlaceholderKey;
  column: number;
  row: number;
};

const SPRITE_POSITIONS: Record<PlaceholderKey, Omit<PlaceholderSpritePosition, "key">> = {
  art: { column: 0, row: 0 },
  baby: { column: 1, row: 0 },
  bike: { column: 2, row: 0 },
  "books-media": { column: 3, row: 0 },
  camera: { column: 4, row: 0 },
  clothing: { column: 5, row: 0 },
  collectibles: { column: 6, row: 0 },
  cookware: { column: 0, row: 1 },
  experiences: { column: 1, row: 1 },
  food: { column: 2, row: 1 },
  furniture: { column: 3, row: 1 },
  "game-console": { column: 4, row: 1 },
  handbag: { column: 5, row: 1 },
  headphones: { column: 6, row: 1 },
  jewelry: { column: 0, row: 2 },
  laptop: { column: 1, row: 2 },
  perfume: { column: 2, row: 2 },
  pets: { column: 3, row: 2 },
  "private-jet": { column: 4, row: 2 },
  property: { column: 5, row: 2 },
  smartphone: { column: 6, row: 2 },
  sneakers: { column: 0, row: 3 },
  sunglasses: { column: 1, row: 3 },
  supercar: { column: 2, row: 3 },
  travel: { column: 3, row: 3 },
  watch: { column: 4, row: 3 },
  wellness: { column: 5, row: 3 },
  yacht: { column: 6, row: 3 },
};

const CATEGORY_DEFAULTS: Record<string, PlaceholderKey> = {
  "luxury:fordon": "supercar",
  "luxury:flyg": "private-jet",
  "luxury:batar": "yacht",
  "luxury:fastigheter": "property",
  "luxury:klockor": "watch",
  "luxury:smycken": "jewelry",
  "luxury:mode": "clothing",
  "luxury:teknik": "laptop",
  "luxury:konst": "art",
  "luxury:samlarobjekt": "collectibles",
  "luxury:resor": "travel",
  "luxury:upplevelser": "experiences",
  "luxury:sport": "bike",
  "luxury:hem-design": "furniture",
  "luxury:mat": "food",
  "luxury:wellness": "wellness",
  "luxury:familj": "baby",
  "luxury:husdjur": "pets",
  "luxury:underhallning": "experiences",
  "luxury:service": "experiences",
  "everyday:mat": "food",
  "everyday:elektronik": "headphones",
  "everyday:mobil": "smartphone",
  "everyday:datorer": "laptop",
  "everyday:gaming": "game-console",
  "everyday:hem": "furniture",
  "everyday:mobler": "furniture",
  "everyday:kok": "cookware",
  "everyday:klader": "clothing",
  "everyday:skor": "sneakers",
  "everyday:skonhet": "perfume",
  "everyday:halsa": "wellness",
  "everyday:traning": "bike",
  "everyday:friluftsliv": "travel",
  "everyday:bocker-media": "books-media",
  "everyday:barn-baby": "baby",
  "everyday:leksaker-hobby": "collectibles",
  "everyday:husdjur": "pets",
  "everyday:transport": "bike",
  "everyday:resor-tjanster": "travel",
};

type KeywordRule = { pattern: RegExp; key: PlaceholderKey };

const CATEGORY_RULES: Record<string, KeywordRule[]> = {
  "luxury:mode": [
    { pattern: /väska|bag|handbag|weekend/i, key: "handbag" },
    { pattern: /sneaker|sko|skor|footwear/i, key: "sneakers" },
    { pattern: /solglas|sunglass/i, key: "sunglasses" },
  ],
  "luxury:teknik": [
    { pattern: /mobil|phone|telefon|satellit/i, key: "smartphone" },
    { pattern: /gaming|spel|vr/i, key: "game-console" },
    { pattern: /kamera|camera/i, key: "camera" },
    { pattern: /hörlur|headphone|ljud|audio|högtal|speaker/i, key: "headphones" },
  ],
  "luxury:hem-design": [
    { pattern: /kök|kitchen|gryta|cook|chef/i, key: "cookware" },
    { pattern: /pool|orangeri|residens|villa/i, key: "property" },
  ],
  "luxury:sport": [
    { pattern: /cykel|bike|cycling/i, key: "bike" },
    { pattern: /sko|sneaker/i, key: "sneakers" },
    { pattern: /segl|surf|vatten|water/i, key: "yacht" },
  ],
  "luxury:underhallning": [
    { pattern: /spel|gaming|arcade/i, key: "game-console" },
    { pattern: /musik|audio|studio|dj|podcast|vinyl|gitarr|flygel/i, key: "headphones" },
  ],
  "luxury:service": [
    { pattern: /chaufför|transport|jet|rese|travel/i, key: "travel" },
  ],
  "everyday:elektronik": [
    { pattern: /kamera|camera/i, key: "camera" },
    { pattern: /hörlur|headphone|soundbar|ljud|audio|högtal|speaker/i, key: "headphones" },
    { pattern: /smartklock|watch/i, key: "watch" },
  ],
  "everyday:hem": [
    { pattern: /lampa|belys|light/i, key: "furniture" },
  ],
  "everyday:skonhet": [
    { pattern: /parfym|doft|fragrance/i, key: "perfume" },
    { pattern: /hårfön|styling|rakapparat/i, key: "headphones" },
  ],
  "everyday:traning": [
    { pattern: /sko|sneaker|löp/i, key: "sneakers" },
    { pattern: /klock|watch/i, key: "watch" },
  ],
  "everyday:friluftsliv": [
    { pattern: /cykel|bike/i, key: "bike" },
  ],
  "everyday:leksaker-hobby": [
    { pattern: /spel|game/i, key: "game-console" },
    { pattern: /samlarkort|kort|modell|bygg|collect/i, key: "collectibles" },
  ],
  "everyday:transport": [
    { pattern: /bil|car|dashcam|takbox|däck/i, key: "supercar" },
    { pattern: /cykel|bike|moped|hjälm/i, key: "bike" },
  ],
  "everyday:resor-tjanster": [
    { pattern: /bio|spa|restaurang|fotografer|upplevel/i, key: "experiences" },
  ],
};

function searchableProductText(product: Product): string {
  return [
    product.name,
    product.brand,
    product.categoryLabel,
    product.subcategoryLabel,
    ...product.tags,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getProductPlaceholderKey(product: Product): PlaceholderKey | null {
  const categoryKey = `${product.mode}:${product.categoryId}`;
  const text = searchableProductText(product);
  const override = CATEGORY_RULES[categoryKey]?.find((rule) => rule.pattern.test(text));
  return override?.key ?? CATEGORY_DEFAULTS[categoryKey] ?? null;
}

export function getProductPlaceholderSprite(product: Product): PlaceholderSpritePosition | null {
  const key = getProductPlaceholderKey(product);
  if (!key) return null;
  return { key, ...SPRITE_POSITIONS[key] };
}
