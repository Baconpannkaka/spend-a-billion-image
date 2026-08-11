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

export const IMAGE_SEARCH_VERSION = 3.1;
export { buildSearchQueries, confidenceFromScore, isAllowedLicense, normalizeForImageSearch };

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MODEL_SENSITIVE_CATEGORIES = new Set(["elektronik", "teknik", "gaming", "mobil", "datorer", "transport", "fordon"]);
const BAD_CONTEXT_TERMS = [
  "logo", "logotype", "diagram", "manual", "brochure", "poster", "screenshot", "advertisement",
  "product launch", "launch event", "keynote", "shop display", "store display",
];
const TOKEN_STOP = new Set([
  "the", "and", "for", "with", "edition", "model", "series", "new", "official", "of", "in",
  "a", "an", "de", "la", "le", "el", "en", "et", "och", "med", "version", "mark", "generation",
]);

function tokens(value = "") {
  return normalizeForImageSearch(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !TOKEN_STOP.has(token));
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

function criticalModelTokens(product) {
  const brand = new Set(tokens(product.brand ?? ""));
  return tokens(product.name).filter((token) => !brand.has(token) && /\d/.test(token));
}

function passesModelSafetyGate(product, candidate) {
  if (!MODEL_SENSITIVE_CATEGORIES.has(product.categoryId)) return true;
  const text = candidateText(candidate);
  const critical = criticalModelTokens(product);
  if (critical.length > 0 && critical.some((token) => !tokens(text).includes(token))) return false;

  const brandTokens = tokens(product.brand ?? "");
  const modelTokens = tokens(product.name).filter((token) => !brandTokens.includes(token));
  const brandCoverage = coverage(brandTokens, text);
  const modelCoverage = coverage(modelTokens, text);
  if (brandTokens.length > 0 && brandCoverage < 0.5) return false;
  return modelTokens.length === 0 || modelCoverage >= 0.45;
}

function rankOpenverse(product, candidates, options = {}) {
  const brandTokens = tokens(product.brand ?? "");
  const modelTokens = tokens(product.name).filter((token) => !brandTokens.includes(token));
  return candidates
    .filter((candidate) => ALLOWED_MIME_TYPES.has(candidate.mime))
    .filter((candidate) => candidate.downloadUrl && candidate.sourceUrl)
    .filter((candidate) => isAllowedLicense(candidate.metadata?.license, candidate.metadata?.licenseUrl))
    .map((candidate) => {
      const text = candidateText(candidate);
      const details = scoreCandidateDetailed(product, candidate, options);
      const brandCoverage = coverage(brandTokens, text);
      const modelCoverage = coverage(modelTokens, text);
      const exactName = normalizeForImageSearch(product.name);
      const exactNameHit = exactName && text.includes(exactName);
      let score = details.score;
      score += brandCoverage * 18;
      score += modelCoverage * 28;
      if (exactNameHit) score += 22;
      if ((candidate.width ?? 0) >= 900 && (candidate.height ?? 0) >= 600) score += 4;
      for (const term of BAD_CONTEXT_TERMS) if (text.includes(term)) score -= 45;
      return {
        ...candidate,
        score: Math.round(score * 10) / 10,
        relevance: {
          ...details,
          brandCoverage,
          modelCoverage,
          exactNameHit,
        },
      };
    })
    .filter((candidate) => {
      const { brandCoverage, modelCoverage, exactNameHit } = candidate.relevance;
      if (brandTokens.length > 0 && brandCoverage < 0.5) return false;
      if (!exactNameHit && modelTokens.length > 0 && modelCoverage < 0.4) return false;
      return passesModelSafetyGate(product, candidate) && candidate.score >= 28;
    })
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
  const rankedCommons = rankCommonsV2(product, commons, options).filter((candidate) => passesModelSafetyGate(product, candidate));
  const rankedOpenverse = rankOpenverse(product, openverse, options);
  return [...rankedCommons, ...rankedOpenverse]
    .sort((a, b) => b.score - a.score || ((b.width ?? 0) * (b.height ?? 0)) - ((a.width ?? 0) * (a.height ?? 0)));
}

export function rankCandidatesWithDiagnostics(product, candidates, options = {}) {
  const licenseEligible = candidates.filter((candidate) =>
    ALLOWED_MIME_TYPES.has(candidate.mime)
    && candidate.downloadUrl
    && candidate.sourceUrl
    && isAllowedLicense(candidate.metadata?.license, candidate.metadata?.licenseUrl),
  );
  const ranked = filterAndRankCandidates(product, candidates, options);
  return {
    ranked,
    diagnostics: {
      raw: candidates.length,
      licenseEligible: licenseEligible.length,
      accepted: ranked.length,
      filteredBeforeRanking: Math.max(0, candidates.length - licenseEligible.length),
      filteredAsIrrelevant: Math.max(0, licenseEligible.length - ranked.length),
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
    ? process.env.OPENVERSE_USER_AGENT ?? "SpendAnythingImageImporter/3.1 (+https://github.com/Baconpannkaka/spend-a-billion-image)"
    : process.env.WIKIMEDIA_USER_AGENT ?? "SpendAnythingImageImporter/3.1 (+https://github.com/Baconpannkaka/spend-a-billion-image)";
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
