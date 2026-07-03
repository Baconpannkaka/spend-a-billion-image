const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const DEFAULT_USER_AGENT = "SpendAnythingImageImporter/1.0 (GitHub project image import; contact via repository issues)";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const REJECTED_TITLE_WORDS = [
  "logo", "logotype", "wordmark", "emblem", "badge", "icon", "diagram", "drawing", "sketch",
  "blueprint", "map", "poster", "advertisement", "advert", "screenshot", "manual", "brochure",
  "interior only", "engine only", "wheel only", "steering wheel", "instrument cluster",
];
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "edition", "model", "series", "new", "official", "of", "in",
  "a", "an", "de", "la", "le", "el", "en", "et", "och", "med", "version", "mark", "generation",
]);

const CATEGORY_HINTS = {
  fordon: "car automobile",
  flyg: "aircraft jet helicopter",
  batar: "yacht boat",
  fastigheter: "property architecture",
  klockor: "watch wristwatch",
  smycken: "jewellery jewelry",
  mode: "fashion product",
  teknik: "technology product",
  konst: "artwork",
  samlarobjekt: "collectible",
  upplevelser: "event",
  resor: "travel",
  mat: "food product",
  elektronik: "electronic product",
  gaming: "gaming product",
  hem: "home product",
  mobler: "furniture",
  klader: "clothing fashion",
  skor: "shoes footwear",
  sport: "sports equipment",
  barn: "children product",
  husdjur: "pet product",
  transport: "vehicle bicycle",
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

function normalize(value = "") {
  return stripHtml(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_–—]/g, " ")
    .replace(/[^a-z0-9\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function tokenCoverage(needles, haystack) {
  if (needles.length === 0) return 0;
  const matches = needles.filter((token) => haystack.includes(token)).length;
  return matches / needles.length;
}

export function scoreCandidate(product, candidate) {
  const title = normalize(candidate.title?.replace(/^File:/i, "").replace(/\.[a-z0-9]{2,5}$/i, "") ?? "");
  const metadataText = normalize(`${candidate.metadata?.description ?? ""} ${candidate.metadata?.credit ?? ""}`);
  const combined = `${title} ${metadataText}`;
  const nameTokens = tokens(product.name);
  const brandTokens = tokens(product.brand ?? "");
  const exactName = normalize(product.name);
  const exactBrand = normalize(product.brand ?? "");

  let score = 0;
  score += tokenCoverage(nameTokens, title) * 58;
  score += tokenCoverage(nameTokens, combined) * 18;
  score += tokenCoverage(brandTokens, title) * 14;
  if (exactName && title.includes(exactName)) score += 28;
  if (exactBrand && title.includes(exactBrand)) score += 8;
  if (candidate.width >= 1200 && candidate.height >= 700) score += 7;
  else if (candidate.width >= 800 && candidate.height >= 500) score += 3;
  if ((candidate.width / Math.max(candidate.height, 1)) >= 1.15) score += 3;
  if (candidate.mime === "image/jpeg") score += 2;

  for (const word of REJECTED_TITLE_WORDS) {
    if (combined.includes(word)) score -= word === "logo" || word === "logotype" ? 70 : 30;
  }
  if (combined.includes("museum") && product.categoryId !== "konst" && product.categoryId !== "samlarobjekt") score -= 4;

  return Math.round(score * 10) / 10;
}

export function confidenceFromScore(score) {
  if (score >= 88) return "high";
  if (score >= 62) return "medium";
  return "low";
}

export function buildSearchQueries(product, overrideQuery) {
  if (overrideQuery) return [overrideQuery];
  const quotedName = `"${product.name.replace(/"/g, "")}"`;
  const brand = product.brand && !normalize(product.name).startsWith(normalize(product.brand)) ? product.brand : "";
  const hint = CATEGORY_HINTS[product.categoryId] ?? "product";
  const queries = [
    `${quotedName} ${brand} ${hint}`.trim(),
    `${product.name} ${brand}`.trim(),
    `${product.name} ${hint}`.trim(),
  ];
  return [...new Set(queries)];
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
  const limit = Math.min(Math.max(Number(options.limit ?? 10), 1), 20);
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

export function filterAndRankCandidates(product, candidates) {
  return candidates
    .filter((candidate) => ALLOWED_MIME_TYPES.has(candidate.mime))
    .filter((candidate) => candidate.downloadUrl && candidate.sourceUrl)
    .filter((candidate) => isAllowedLicense(candidate.metadata.license, candidate.metadata.licenseUrl))
    .map((candidate) => ({ ...candidate, score: scoreCandidate(product, candidate) }))
    .filter((candidate) => candidate.score > 15)
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
};
