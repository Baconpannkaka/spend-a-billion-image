const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const DEFAULT_USER_AGENT = "SpendAnythingImageImporter/2.0 (GitHub project image import; contact via repository issues)";

export const IMAGE_SEARCH_VERSION = 2;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const REJECTED_TITLE_WORDS = [
  "logo", "logotype", "wordmark", "emblem", "badge", "icon", "diagram", "drawing", "sketch",
  "blueprint", "map", "poster", "advertisement", "advert", "screenshot", "manual", "brochure",
];
const DETAIL_ONLY_WORDS = [
  "engine", "dashboard", "instrument cluster", "steering wheel", "wheel only", "interior only",
  "cockpit only", "seat only", "battery pack", "camera module", "motherboard",
];
const ELECTRONICS_CONTEXT_WORDS = [
  "launch event", "product launch", "keynote", "inside store", "in store", "shop display", "hands on",
];
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "edition", "model", "series", "new", "official", "of", "in",
  "a", "an", "de", "la", "le", "el", "en", "et", "och", "med", "version", "mark", "generation",
]);
const STRICT_VARIANT_TOKENS = new Set([
  "pro", "max", "ultra", "plus", "air", "mini", "fold", "flip", "edge", "fe", "se",
]);
const STRICT_VARIANT_CATEGORIES = new Set(["elektronik", "teknik", "gaming"]);

const CATEGORY_HINTS = {
  fordon: "car automobile vehicle",
  flyg: "aircraft jet helicopter aviation",
  batar: "yacht boat ship",
  fastigheter: "property house architecture estate",
  klockor: "watch wristwatch timepiece",
  smycken: "jewellery jewelry",
  mode: "fashion handbag clothing",
  teknik: "electronics device computer phone camera",
  konst: "artwork painting sculpture",
  samlarobjekt: "collectible memorabilia",
  upplevelser: "event experience",
  resor: "travel hotel resort",
  mat: "food product",
  elektronik: "electronics device product",
  gaming: "gaming console computer accessory",
  hem: "home appliance product",
  mobler: "furniture chair table",
  klader: "clothing fashion",
  skor: "shoes footwear",
  sport: "sports equipment",
  barn: "children baby product",
  husdjur: "pet product",
  transport: "vehicle bicycle scooter",
};

export function stripHtml(value = "") {
  return String(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeForImageSearch(value = "") {
  return stripHtml(value)
    .replace(/([a-z0-9])\/([a-z0-9])/gi, "$1$2")
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_–—]/g, " ")
    .replace(/[^a-z0-9\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const normalize = normalizeForImageSearch;

export function normalizeLicense(value = "") {
  return normalize(value)
    .replace(/creative commons/g, "cc")
    .replace(/attribution share alike/g, "by-sa")
    .replace(/attribution-sharealike/g, "by-sa")
    .replace(/attribution/g, "by")
    .replace(/public domain mark/g, "public domain")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAllowedLicense(license = "", licenseUrl = "") {
  const normalized = `${normalizeLicense(license)} ${normalize(licenseUrl)}`;
  if (/\b(nc|noncommercial|non-commercial|nd|no derivatives|no-derivatives)\b/.test(normalized)) return false;
  if (normalized.includes("cc0") || normalized.includes("public domain") || normalized.includes("pdm")) return true;
  return /\bcc[- ]?by(?:[- ]?sa)?\b/.test(normalized) || /creativecommons\.org\/licenses\/by(?:-sa)?\//.test(normalized);
}

function getExtValue(extmetadata, key) {
  const value = extmetadata?.[key];
  if (!value) return "";
  return stripHtml(typeof value === "string" ? value : value.value ?? "");
}

export function metadataFromImageInfo(imageInfo = {}) {
  const ext = imageInfo.extmetadata ?? {};
  const license = getExtValue(ext, "LicenseShortName") || getExtValue(ext, "UsageTerms");
  const licenseUrl = getExtValue(ext, "LicenseUrl");
  const creator = getExtValue(ext, "Artist") || getExtValue(ext, "Credit") || imageInfo.user || "";
  const description = getExtValue(ext, "ImageDescription") || getExtValue(ext, "ObjectName");
  return {
    license,
    licenseUrl,
    creator,
    description,
    attribution: getExtValue(ext, "Attribution"),
    credit: getExtValue(ext, "Credit"),
  };
}

function tokens(value) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function tokenCoverage(needles, haystack) {
  if (needles.length === 0) return 0;
  const haystackTokens = new Set(tokens(haystack));
  const matches = needles.filter((token) => haystackTokens.has(token)).length;
  return matches / needles.length;
}

function nameWithoutBrand(product) {
  const name = String(product.name ?? "").trim();
  const brand = String(product.brand ?? "").trim();
  if (!brand) return name;
  const normalizedName = normalize(name);
  const normalizedBrand = normalize(brand);
  if (!normalizedName.startsWith(normalizedBrand)) return name;
  return name.slice(brand.length).replace(/^\s*[-–—:]?\s*/, "").trim() || name;
}

function simplifySearchName(value) {
  return String(value ?? "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(?:PSA|CGC|BGS)\s*\d+(?:\.\d+)?\b/gi, " ")
    .replace(/\b\d+(?:\.\d+)?\s?(?:GB|TB|mm|cm)\b/gi, " ")
    .replace(/\b(?:medium|large|small|xl|xxl)\b/gi, " ")
    .replace(/\b(?:limited edition|special edition)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function strictVariantInfo(product, candidateTitle) {
  if (!STRICT_VARIANT_CATEGORIES.has(product.categoryId)) return { missing: [], conflicting: [] };
  const target = new Set(tokens(product.name));
  const candidate = new Set(tokens(candidateTitle));
  const missing = [...STRICT_VARIANT_TOKENS].filter((token) => target.has(token) && !candidate.has(token));
  const conflicting = [...STRICT_VARIANT_TOKENS].filter((token) => !target.has(token) && candidate.has(token));
  return { missing, conflicting };
}

function candidateText(candidate) {
  const title = normalize(candidate.title?.replace(/^File:/i, "").replace(/\.[a-z0-9]{2,5}$/i, "") ?? "");
  const metadataText = normalize(`${candidate.metadata?.description ?? ""} ${candidate.metadata?.credit ?? ""}`);
  return { title, metadataText, combined: `${title} ${metadataText}`.trim() };
}

export function scoreCandidateDetailed(product, candidate, options = {}) {
  const { title, combined } = candidateText(candidate);
  const nameTokens = tokens(product.name);
  const brandTokens = tokens(product.brand ?? "");
  const modelTokens = nameTokens.filter((token) => !brandTokens.includes(token));
  const exactName = normalize(product.name);
  const exactBrand = normalize(product.brand ?? "");
  const modelTitleCoverage = tokenCoverage(modelTokens, title);
  const modelCombinedCoverage = tokenCoverage(modelTokens, combined);
  const brandTitleCoverage = tokenCoverage(brandTokens, title);
  const brandCombinedCoverage = tokenCoverage(brandTokens, combined);
  const strict = strictVariantInfo(product, title);
  const criticalTokens = modelTokens.filter((token) => /\d/.test(token));
  const missingCritical = criticalTokens.filter((token) => !tokens(combined).includes(token));
  const hasExactName = exactName && title.includes(exactName) && strict.conflicting.length === 0;

  let score = 0;
  score += modelTitleCoverage * 62;
  score += modelCombinedCoverage * 16;
  score += brandTitleCoverage * 14;
  if (hasExactName) score += 30;
  if (exactBrand && title.includes(exactBrand)) score += 8;
  if (candidate.width >= 1200 && candidate.height >= 700) score += 7;
  else if (candidate.width >= 800 && candidate.height >= 500) score += 3;
  if ((candidate.width / Math.max(candidate.height, 1)) >= 1.15) score += 3;
  if (candidate.mime === "image/jpeg") score += 2;

  for (const word of REJECTED_TITLE_WORDS) {
    if (combined.includes(word)) score -= word === "logo" || word === "logotype" ? 75 : 34;
  }
  for (const word of DETAIL_ONLY_WORDS) {
    if (combined.includes(word) && !normalize(product.name).includes(word)) score -= 38;
  }
  if (STRICT_VARIANT_CATEGORIES.has(product.categoryId)) {
    score -= strict.missing.length * 30;
    score -= strict.conflicting.length * 48;
    for (const word of ELECTRONICS_CONTEXT_WORDS) {
      if (combined.includes(word)) score -= 28;
    }
  } else {
    score -= missingCritical.length * 14;
  }

  const learnedBadTerms = options.learnedBadTerms ?? [];
  for (const term of learnedBadTerms) {
    const normalizedTerm = normalize(term);
    if (normalizedTerm && combined.includes(normalizedTerm) && !normalize(product.name).includes(normalizedTerm)) score -= 14;
  }

  if (brandTokens.length > 0 && brandCombinedCoverage === 0) score -= 28;
  if (modelTokens.length > 0 && modelCombinedCoverage === 0) score -= 45;
  if (combined.includes("museum") && product.categoryId !== "konst" && product.categoryId !== "samlarobjekt") score -= 4;

  const relevant = modelTokens.length === 0
    ? brandCombinedCoverage > 0
    : brandCombinedCoverage > 0
      ? modelCombinedCoverage >= 0.25
      : modelCombinedCoverage >= 0.7;

  return {
    score: Math.round(score * 10) / 10,
    relevant,
    modelTitleCoverage,
    modelCombinedCoverage,
    brandTitleCoverage,
    strictMissing: strict.missing,
    strictConflicting: strict.conflicting,
  };
}

export function scoreCandidate(product, candidate, options = {}) {
  return scoreCandidateDetailed(product, candidate, options).score;
}

export function confidenceFromScore(score) {
  if (score >= 118) return "high";
  if (score >= 64) return "medium";
  return "low";
}

export function buildSearchQueries(product, overrideQuery) {
  if (overrideQuery) return [overrideQuery];

  const fullName = String(product.name ?? "").replace(/"/g, "").trim();
  const brand = String(product.brand ?? "").trim();
  const coreName = nameWithoutBrand(product).replace(/"/g, "").trim();
  const simplifiedCore = simplifySearchName(coreName);
  const hint = CATEGORY_HINTS[product.categoryId] ?? "product";
  const brandOutsideName = brand && !normalize(fullName).startsWith(normalize(brand)) ? brand : "";
  const distinctive = tokens(simplifiedCore).slice(0, 4).join(" ");

  return unique([
    `"${fullName}" ${brandOutsideName} ${hint}`.trim(),
    `"${fullName}" ${brandOutsideName}`.trim(),
    `${fullName} ${brandOutsideName} ${hint}`.trim(),
    coreName !== fullName ? `"${coreName}" ${brand} ${hint}`.trim() : "",
    simplifiedCore && simplifiedCore !== coreName ? `"${simplifiedCore}" ${brand} ${hint}`.trim() : "",
    `${brand} ${simplifiedCore || coreName} ${hint}`.trim(),
    distinctive ? `${brand} ${distinctive}`.trim() : "",
  ]).filter((query) => query && query !== "\"\"");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 || response.status >= 500) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) await sleep(900 * (attempt + 1));
    }
  }
  throw lastError;
}

function makeApiUrl(params) {
  const url = new URL(COMMONS_API);
  for (const [key, value] of Object.entries({ action: "query", format: "json", formatversion: "2", ...params })) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

function pageToCandidate(page) {
  const imageInfo = page.imageinfo?.[0];
  if (!imageInfo) return null;
  const metadata = metadataFromImageInfo(imageInfo);
  const width = Number(imageInfo.thumbwidth ?? imageInfo.width ?? 0);
  const height = Number(imageInfo.thumbheight ?? imageInfo.height ?? 0);
  return {
    title: page.title,
    pageId: page.pageid,
    sourceUrl: imageInfo.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
    downloadUrl: imageInfo.thumburl ?? imageInfo.url,
    originalUrl: imageInfo.url,
    mime: imageInfo.thumbmime ?? imageInfo.mime,
    width,
    height,
    sha1: imageInfo.sha1 ?? "",
    metadata,
  };
}

export async function getCommonsFile(title, options = {}) {
  const userAgent = options.userAgent ?? process.env.WIKIMEDIA_USER_AGENT ?? DEFAULT_USER_AGENT;
  const url = makeApiUrl({
    prop: "imageinfo",
    titles: title.startsWith("File:") ? title : `File:${title}`,
    iiprop: "url|extmetadata|mime|size|sha1|user",
    iiurlwidth: options.width ?? 1600,
    iiextmetadatalanguage: "en",
  });
  const response = await fetchWithRetry(url, { headers: { "User-Agent": userAgent, Accept: "application/json" } });
  const json = await response.json();
  const page = json.query?.pages?.[0];
  return page ? pageToCandidate(page) : null;
}

export async function searchCommons(query, options = {}) {
  const userAgent = options.userAgent ?? process.env.WIKIMEDIA_USER_AGENT ?? DEFAULT_USER_AGENT;
  const limit = Math.min(Math.max(Number(options.limit ?? 12), 1), 20);
  const url = makeApiUrl({
    generator: "search",
    gsrsearch: query,
    gsrnamespace: 6,
    gsrlimit: limit,
    gsrwhat: "text",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size|sha1|user",
    iiurlwidth: options.width ?? 1600,
    iiextmetadatalanguage: "en",
  });
  const response = await fetchWithRetry(url, { headers: { "User-Agent": userAgent, Accept: "application/json" } });
  const json = await response.json();
  return (json.query?.pages ?? []).map(pageToCandidate).filter(Boolean);
}

export function filterAndRankCandidates(product, candidates, options = {}) {
  return candidates
    .filter((candidate) => ALLOWED_MIME_TYPES.has(candidate.mime))
    .filter((candidate) => candidate.downloadUrl && candidate.sourceUrl)
    .filter((candidate) => isAllowedLicense(candidate.metadata.license, candidate.metadata.licenseUrl))
    .map((candidate) => {
      const details = scoreCandidateDetailed(product, candidate, options);
      return { ...candidate, score: details.score, relevance: details };
    })
    .filter((candidate) => candidate.relevance.relevant && candidate.score > 15)
    .sort((a, b) => b.score - a.score || (b.width * b.height) - (a.width * a.height));
}

export async function downloadCandidate(candidate, destination, options = {}) {
  const userAgent = options.userAgent ?? process.env.WIKIMEDIA_USER_AGENT ?? DEFAULT_USER_AGENT;
  const response = await fetchWithRetry(candidate.downloadUrl, { headers: { "User-Agent": userAgent, Accept: "image/*" } }, 4);
  const arrayBuffer = await response.arrayBuffer();
  const maxBytes = Number(options.maxBytes ?? 25_000_000);
  if (arrayBuffer.byteLength > maxBytes) throw new Error(`Bilden är för stor (${arrayBuffer.byteLength} bytes).`);
  await import("node:fs/promises").then(({ writeFile }) => writeFile(destination, Buffer.from(arrayBuffer)));
}

export const wikimediaImageConstants = {
  COMMONS_API,
  DEFAULT_USER_AGENT,
  ALLOWED_MIME_TYPES: [...ALLOWED_MIME_TYPES],
  CATEGORY_HINTS,
};
