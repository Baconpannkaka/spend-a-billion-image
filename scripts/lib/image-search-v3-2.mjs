import { writeFile } from "node:fs/promises";
import {
  buildSearchQueries,
  confidenceFromScore,
  getCommonsFile as getCommonsFileV3,
  normalizeForImageSearch,
  searchCommons as searchCommonsV3,
  searchOpenverse as searchOpenverseV3,
} from "./image-search-v3.mjs";
import {
  filterAndRankCandidates as rankCommonsV2,
  isAllowedLicense,
  scoreCandidateDetailed,
} from "./wikimedia-images.mjs";

export const IMAGE_SEARCH_VERSION = 3.2;
export { buildSearchQueries, confidenceFromScore, isAllowedLicense, normalizeForImageSearch };

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const TOKEN_STOP = new Set([
  "the", "and", "for", "with", "edition", "model", "new", "official", "of", "in",
  "a", "an", "de", "la", "le", "el", "en", "et", "och", "med", "version", "mark", "generation",
]);

const HARD_CONTEXT_REJECT = [
  "lifestyle", "launch event", "product launch", "keynote", "press event", "trade show",
  "taken with", "shot with", "shot on", "captured with", "mapillary", "dashcam",
  "harbour", "harbor", "variety of watercraft", "fleet", "marina", "road trip",
  "advertisement", "advert", "promotion", "promo", "coupon", "sale banner",
  "store display", "shop display", "accessories bundle", "accessories.jpg",
];

const SOFT_CONTEXT_PENALTIES = [
  ["people", -18], ["group", -18], ["event", -24], ["launch", -28], ["review", -8],
  ["unboxing", -12], ["hands on", -12], ["booth", -20], ["showroom", -12],
  ["interior", -22], ["dashboard", -28], ["engine", -35], ["logo", -45],
  ["poster", -45], ["diagram", -45], ["screenshot", -45],
];

const STRICT_NAME_HINTS = [
  "iphone", "ipad", "macbook", "galaxy", "pixel", "fairphone", "zenbook", "thinkpad", "surface",
  "gopro", "hero", "xbox", "playstation", "nintendo", "switch", "steam deck", "camera",
  "watch", "yacht", "roadster", "coupe", "sedan", "suv", "motorcycle", "drone",
];

function tokens(value = "") {
  return normalizeForImageSearch(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !TOKEN_STOP.has(token));
}

function rawWords(value = "") {
  return String(value).match(/[A-Za-z0-9+.-]+/g) ?? [];
}

function candidateText(candidate) {
  return normalizeForImageSearch([
    candidate.title,
    candidate.metadata?.description,
    candidate.metadata?.credit,
    candidate.metadata?.attribution,
    candidate.provider,
    candidate.source,
  ].filter(Boolean).join(" "));
}

function coverage(needles, text) {
  if (needles.length === 0) return 1;
  const haystack = new Set(tokens(text));
  return needles.filter((token) => haystack.has(token)).length / needles.length;
}

function significantIdentityTokens(product) {
  const brand = new Set(tokens(product.brand ?? ""));
  const result = [];
  for (const raw of rawWords(product.name)) {
    const normalized = normalizeForImageSearch(raw);
    if (!normalized || brand.has(normalized) || TOKEN_STOP.has(normalized)) continue;
    const singleUpper = /^[A-Z]$/.test(raw);
    const hasDigit = /\d/.test(raw);
    if (normalized.length > 1 || singleUpper || hasDigit) result.push(normalized);
  }
  return [...new Set(result)];
}

function dimensionTokens(product) {
  const value = String(product.name ?? "");
  const matches = [...value.matchAll(/\b(\d+(?:[.,]\d+)?)\s*(mm|cm|m|inch|inches|\")\b/gi)];
  return matches.flatMap((match) => [normalizeForImageSearch(match[1]), normalizeForImageSearch(match[2])]);
}

function isStrictIdentityProduct(product) {
  const text = normalizeForImageSearch(`${product.brand ?? ""} ${product.name ?? ""}`);
  return STRICT_NAME_HINTS.some((hint) => text.includes(hint));
}

function hasHardBadContext(candidate) {
  const text = candidateText(candidate);
  return HARD_CONTEXT_REJECT.some((term) => text.includes(term));
}

function identityGate(product, candidate) {
  const text = candidateText(candidate);
  const textTokens = new Set(tokens(text));
  const brandTokens = tokens(product.brand ?? "");
  const identity = significantIdentityTokens(product);
  const dimensions = dimensionTokens(product);

  if (brandTokens.length > 0 && coverage(brandTokens, text) < 0.5) return false;
  if (dimensions.length > 0 && dimensions.some((token) => !textTokens.has(token))) return false;

  if (isStrictIdentityProduct(product)) {
    if (identity.length > 0 && identity.some((token) => !textTokens.has(token))) return false;
  } else if (identity.length > 1 && coverage(identity, text) < 0.5) {
    return false;
  }
  return true;
}

function applyContextPenalty(score, candidate) {
  const text = candidateText(candidate);
  let next = score;
  for (const [term, penalty] of SOFT_CONTEXT_PENALTIES) if (text.includes(term)) next += penalty;
  return next;
}

function rankOpenverse(product, candidates, options = {}) {
  const brandTokens = tokens(product.brand ?? "");
  const identity = significantIdentityTokens(product);
  const exactName = normalizeForImageSearch(product.name);

  return candidates
    .filter((candidate) => ALLOWED_MIME_TYPES.has(candidate.mime))
    .filter((candidate) => candidate.downloadUrl && candidate.sourceUrl)
    .filter((candidate) => isAllowedLicense(candidate.metadata?.license, candidate.metadata?.licenseUrl))
    .filter((candidate) => !hasHardBadContext(candidate))
    .filter((candidate) => identityGate(product, candidate))
    .map((candidate) => {
      const text = candidateText(candidate);
      const details = scoreCandidateDetailed(product, candidate, options);
      const brandCoverage = coverage(brandTokens, text);
      const identityCoverage = coverage(identity, text);
      const exactNameHit = Boolean(exactName && text.includes(exactName));
      let score = details.score;
      score += brandCoverage * 18;
      score += identityCoverage * 32;
      if (exactNameHit) score += 26;
      if ((candidate.width ?? 0) >= 900 && (candidate.height ?? 0) >= 600) score += 4;
      score = applyContextPenalty(score, candidate);
      return {
        ...candidate,
        score: Math.round(score * 10) / 10,
        relevance: { ...details, brandCoverage, identityCoverage, exactNameHit },
      };
    })
    .filter((candidate) => candidate.score >= 52)
    .sort((a, b) => b.score - a.score || ((b.width ?? 0) * (b.height ?? 0)) - ((a.width ?? 0) * (a.height ?? 0)));
}

function rankCommons(product, candidates, options = {}) {
  return rankCommonsV2(product, candidates, options)
    .filter((candidate) => !hasHardBadContext(candidate))
    .filter((candidate) => identityGate(product, candidate))
    .map((candidate) => ({ ...candidate, score: Math.round(applyContextPenalty(candidate.score, candidate) * 10) / 10 }))
    .filter((candidate) => candidate.score >= 52)
    .sort((a, b) => b.score - a.score || ((b.width ?? 0) * (b.height ?? 0)) - ((a.width ?? 0) * (a.height ?? 0)));
}

export async function searchCommons(query, options = {}) {
  return searchCommonsV3(query, options);
}

export async function searchOpenverse(query, options = {}) {
  return searchOpenverseV3(query, options);
}

export async function getCommonsFile(title, options = {}) {
  return getCommonsFileV3(title, options);
}

export function filterAndRankCandidates(product, candidates, options = {}) {
  const commons = candidates.filter((candidate) => candidate.sourceType !== "openverse");
  const openverse = candidates.filter((candidate) => candidate.sourceType === "openverse");
  return [...rankCommons(product, commons, options), ...rankOpenverse(product, openverse, options)]
    .sort((a, b) => b.score - a.score || ((b.width ?? 0) * (b.height ?? 0)) - ((a.width ?? 0) * (a.height ?? 0)));
}

export function rankCandidatesWithDiagnostics(product, candidates, options = {}) {
  const licenseEligible = candidates.filter((candidate) =>
    ALLOWED_MIME_TYPES.has(candidate.mime)
    && candidate.downloadUrl
    && candidate.sourceUrl
    && isAllowedLicense(candidate.metadata?.license, candidate.metadata?.licenseUrl),
  );
  const contextEligible = licenseEligible.filter((candidate) => !hasHardBadContext(candidate));
  const identityEligible = contextEligible.filter((candidate) => identityGate(product, candidate));
  const ranked = filterAndRankCandidates(product, candidates, options);
  return {
    ranked,
    diagnostics: {
      raw: candidates.length,
      licenseEligible: licenseEligible.length,
      contextEligible: contextEligible.length,
      identityEligible: identityEligible.length,
      accepted: ranked.length,
      filteredBeforeRanking: Math.max(0, candidates.length - licenseEligible.length),
      filteredByContext: Math.max(0, licenseEligible.length - contextEligible.length),
      filteredByIdentity: Math.max(0, contextEligible.length - identityEligible.length),
      filteredAsIrrelevant: Math.max(0, identityEligible.length - ranked.length),
    },
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

async function fetchImage(url, userAgent, accept) {
  const headers = { "User-Agent": userAgent };
  if (accept) headers.Accept = accept;
  const response = await fetch(url, { headers, redirect: "follow" });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const contentType = String(response.headers.get("content-type") ?? "").toLowerCase();
  if (contentType && !contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
    throw new Error(`Oväntad content-type: ${contentType}`);
  }
  return response;
}

export async function downloadCandidate(candidate, destination, options = {}) {
  const userAgent = candidate.sourceType === "openverse"
    ? process.env.OPENVERSE_USER_AGENT ?? "SpendAnythingImageImporter/3.2 (+https://github.com/Baconpannkaka/spend-a-billion-image)"
    : process.env.WIKIMEDIA_USER_AGENT ?? "SpendAnythingImageImporter/3.2 (+https://github.com/Baconpannkaka/spend-a-billion-image)";
  const urls = unique([candidate.downloadUrl, candidate.originalUrl]);
  const accepts = ["image/avif,image/webp,image/apng,image/*,*/*;q=0.8", "*/*", ""];
  let lastError;

  for (const url of urls) {
    for (const accept of accepts) {
      try {
        const response = await fetchImage(url, userAgent, accept);
        const arrayBuffer = await response.arrayBuffer();
        const maxBytes = Number(options.maxBytes ?? 25_000_000);
        if (arrayBuffer.byteLength > maxBytes) throw new Error(`Bilden är för stor (${arrayBuffer.byteLength} bytes).`);
        await writeFile(destination, Buffer.from(arrayBuffer));
        return;
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        if (/HTTP 429|HTTP 5\d\d/.test(message)) await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }
  }
  throw lastError ?? new Error("Kunde inte ladda ned bildkandidaten.");
}
