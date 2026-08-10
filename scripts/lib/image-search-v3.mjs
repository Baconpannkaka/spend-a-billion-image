import { writeFile } from "node:fs/promises";
import {
  buildSearchQueries,
  confidenceFromScore,
  filterAndRankCandidates as rankV2,
  getCommonsFile as getCommonsFileV2,
  isAllowedLicense,
  normalizeForImageSearch,
  searchCommons as searchCommonsV2,
} from "./wikimedia-images.mjs";
import { searchOpenverse as searchOpenverseRaw } from "./openverse-images.mjs";

export const IMAGE_SEARCH_VERSION = 3;
export { buildSearchQueries, confidenceFromScore, isAllowedLicense, normalizeForImageSearch };

export async function searchCommons(query, options = {}) {
  const results = await searchCommonsV2(query, options);
  return results.map((candidate) => ({
    ...candidate,
    sourceType: "commons",
    provider: "Wikimedia Commons",
    source: "wikimedia",
  }));
}

export async function getCommonsFile(title, options = {}) {
  const candidate = await getCommonsFileV2(title, options);
  return candidate ? {
    ...candidate,
    sourceType: "commons",
    provider: "Wikimedia Commons",
    source: "wikimedia",
  } : null;
}

export async function searchOpenverse(query, options = {}) {
  return searchOpenverseRaw(query, options);
}

export function filterAndRankCandidates(product, candidates, options = {}) {
  return rankV2(product, candidates, options);
}

export function isSmartAutoApproveCandidate(product, candidate) {
  if (!candidate || candidate.sourceType !== "commons" || candidate.score < 138) return false;
  const normalizedName = normalizeForImageSearch(product.name);
  const normalizedTitle = normalizeForImageSearch(String(candidate.title ?? "").replace(/^File:/i, "").replace(/\.[a-z0-9]{2,5}$/i, ""));
  if (!normalizedName || !normalizedTitle.includes(normalizedName)) return false;
  const relevance = candidate.relevance ?? {};
  return (relevance.strictMissing?.length ?? 0) === 0 && (relevance.strictConflicting?.length ?? 0) === 0;
}

export async function downloadCandidate(candidate, destination, options = {}) {
  const userAgent = candidate.sourceType === "openverse"
    ? process.env.OPENVERSE_USER_AGENT ?? "SpendAnythingImageImporter/3.0 (+https://github.com/Baconpannkaka/spend-a-billion-image)"
    : process.env.WIKIMEDIA_USER_AGENT ?? "SpendAnythingImageImporter/3.0 (+https://github.com/Baconpannkaka/spend-a-billion-image)";
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(candidate.downloadUrl, { headers: { "User-Agent": userAgent, Accept: "image/*" } });
      if (response.status === 429 || response.status >= 500) throw new Error(`HTTP ${response.status}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      const maxBytes = Number(options.maxBytes ?? 25_000_000);
      if (arrayBuffer.byteLength > maxBytes) throw new Error(`Bilden är för stor (${arrayBuffer.byteLength} bytes).`);
      await writeFile(destination, Buffer.from(arrayBuffer));
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw lastError;
}
