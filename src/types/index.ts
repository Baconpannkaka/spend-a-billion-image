export const GAME_MODES = ["luxury", "everyday"] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const LANGUAGE_CODES = ["sv", "en", "es", "zh", "hi", "ar"] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const CURRENCY_CODES = ["SEK", "USD", "EUR", "GBP", "NOK", "DKK", "CHF", "JPY", "CAD", "AUD"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export type CatalogSubcategory = {
  id: string;
  label: string;
  localizedLabels?: Partial<Record<LanguageCode, string>>;
};

export type CatalogCategory = {
  id: string;
  label: string;
  description: string;
  localizedLabels?: Partial<Record<LanguageCode, string>>;
  localizedDescriptions?: Partial<Record<LanguageCode, string>>;
  subcategories: CatalogSubcategory[];
};

export type CollectibleCardDetails = {
  franchise: string;
  set: string;
  year: string;
  cardNumber: string;
  language: string;
  gradingCompany: string;
  grade: number;
  populationNote?: string;
};

export type ProductNameKind = "official" | "translatable";
export type ProductDataQuality = "verified" | "curated" | "generated";
export type ProductPriceType = "official-retail" | "market-estimate" | "fantasy-estimate";

export type ProductLocalization = {
  name?: string;
  shortDescription?: string;
  description?: string;
  facts?: string[];
  categoryLabel?: string;
  subcategoryLabel?: string;
};

export type Product = {
  id: string;
  mode: GameMode;
  slug: string;
  name: string;
  brand?: string;
  categoryId: string;
  categoryLabel: string;
  subcategoryId: string;
  subcategoryLabel: string;
  priceSek: number;
  shortDescription: string;
  description: string;
  facts: string[];
  tags: string[];
  featured?: boolean;
  collectible?: CollectibleCardDetails;
  nameKind?: ProductNameKind;
  localizations?: Partial<Record<LanguageCode, ProductLocalization>>;
  dataQuality?: ProductDataQuality;
  priceType?: ProductPriceType;
  priceCheckedAt?: string;
  sourceUrls?: string[];
};

export type CatalogQualityStats = {
  verified: number;
  curated: number;
  generated: number;
};

export type ProductCatalog = {
  version: number;
  mode: GameMode;
  generatedAt: string;
  productCount: number;
  qualityStats?: CatalogQualityStats;
  categories: CatalogCategory[];
  products: Product[];
};

export type ProductImageStatus = "placeholder" | "unreviewed" | "approved" | "rejected";
export type ImageConfidence = "high" | "medium" | "low" | "none";
export type ImageReviewStatus = "pending" | "approved" | "rejected" | "no-match" | "error";

export type ProductImageRecord = {
  productId: string;
  path: string;
  alt: string;
  sourceUrl: string;
  creator?: string;
  license: string;
  licenseUrl?: string;
  status: ProductImageStatus;
  width?: number;
  height?: number;
  reviewedAt?: string;
  importedAt?: string;
  commonsTitle?: string;
  confidence?: Exclude<ImageConfidence, "none">;
  score?: number;
  sha1?: string;
  mime?: string;
};

export type ImageManifest = {
  version: number;
  generatedAt: string;
  images: ProductImageRecord[];
};

export type ImageReviewCandidate = {
  title: string;
  sourceUrl: string;
  creator?: string;
  license: string;
  licenseUrl?: string;
  width?: number;
  height?: number;
  score: number;
  path?: string;
};

export type ImageReviewItem = {
  productId: string;
  mode?: GameMode;
  productName: string;
  brand?: string;
  categoryLabel?: string;
  query?: string;
  status: ImageReviewStatus;
  confidence: ImageConfidence;
  score: number;
  importedAt: string;
  reviewedAt?: string;
  selected: ImageReviewCandidate | null;
  alternatives: ImageReviewCandidate[];
  notes: string[];
};

export type ImageReviewQueue = {
  version: number;
  generatedAt: string;
  items: ImageReviewItem[];
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type BudgetSource =
  | { kind: "classic" }
  | { kind: "everyday-preset"; presetId: string; label: string }
  | { kind: "custom"; label: string }
  | { kind: "person"; personId: string; personName: string }
  | {
      kind: "stock";
      stockName: string;
      shares: number;
      targetPrice: number;
      quoteCurrency: CurrencyCode;
    };

export type GameSetup = {
  mode: GameMode;
  startingBudgetSek: number;
  currency: CurrencyCode;
  budgetSource: BudgetSource;
};

export type CompletedResult = GameSetup & {
  name: string;
  cart: CartItem[];
  completedAt: string;
};

export type SharePayloadV3 = {
  v: 3;
  m: GameMode;
  n: string;
  i: Array<[string, number]>;
  b: number;
  c: CurrencyCode;
  s: BudgetSource;
  t?: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
};
