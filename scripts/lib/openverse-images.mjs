const OPENVERSE_API = "https://api.openverse.org/v1/images/";
const DEFAULT_USER_AGENT = "SpendAnythingImageImporter/3.0 (+https://github.com/Baconpannkaka/spend-a-billion-image)";
const ALLOWED_LICENSES = "cc0,pdm,by,by-sa";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retries = 4) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get("retry-after"));
        if (attempt < retries - 1) {
          await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1200 * (attempt + 1));
          continue;
        }
      }
      if (!response.ok) throw new Error(`Openverse HTTP ${response.status}: ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) await sleep(1200 * (attempt + 1));
    }
  }
  throw lastError;
}

function mimeFromResult(result) {
  const filetype = String(result.filetype ?? "").toLowerCase().replace(/^\./, "");
  if (["jpg", "jpeg"].includes(filetype)) return "image/jpeg";
  if (filetype === "png") return "image/png";
  if (filetype === "webp") return "image/webp";
  const url = String(result.url ?? result.thumbnail ?? "").toLowerCase();
  if (/\.png(?:$|\?)/.test(url)) return "image/png";
  if (/\.webp(?:$|\?)/.test(url)) return "image/webp";
  return "image/jpeg";
}

function prettyLicense(license, version) {
  const slug = String(license ?? "").toLowerCase();
  const suffix = version ? ` ${version}` : "";
  if (slug === "cc0") return `CC0${suffix || " 1.0"}`;
  if (slug === "pdm") return "Public Domain Mark";
  if (slug === "by") return `CC BY${suffix}`;
  if (slug === "by-sa") return `CC BY-SA${suffix}`;
  return `${String(license ?? "")}${suffix}`.trim();
}

function isWikimediaDuplicate(result) {
  const text = `${result.provider ?? ""} ${result.source ?? ""} ${result.foreign_landing_url ?? ""}`.toLowerCase();
  return text.includes("wikimedia") || text.includes("commons.wikimedia.org");
}

export function openverseResultToCandidate(result) {
  if (!result || isWikimediaDuplicate(result)) return null;
  const sourceUrl = result.foreign_landing_url || result.detail_url;
  const downloadUrl = result.id
    ? `${OPENVERSE_API}${result.id}/thumb/?full_size=true&compressed=true`
    : result.url || result.thumbnail;
  if (!sourceUrl || !downloadUrl) return null;
  const tagText = Array.isArray(result.tags)
    ? result.tags.map((tag) => typeof tag === "string" ? tag : tag?.name).filter(Boolean).join(" ")
    : "";
  return {
    title: result.title || "Openverse image",
    pageId: result.id,
    sourceUrl,
    downloadUrl,
    originalUrl: result.url || result.thumbnail || downloadUrl,
    mime: mimeFromResult(result),
    width: Number(result.width ?? 0),
    height: Number(result.height ?? 0),
    sha1: "",
    sourceType: "openverse",
    provider: result.provider || "Openverse",
    source: result.source || "",
    metadata: {
      license: prettyLicense(result.license, result.license_version),
      licenseUrl: result.license_url || "",
      creator: result.creator || "",
      description: tagText,
      attribution: result.attribution || "",
      credit: `${result.provider ?? ""} ${result.source ?? ""}`.trim(),
    },
  };
}

export async function searchOpenverse(query, options = {}) {
  const limit = Math.min(Math.max(Number(options.limit ?? 12), 1), 20);
  const url = new URL(OPENVERSE_API);
  url.searchParams.set("q", query);
  url.searchParams.set("license", ALLOWED_LICENSES);
  url.searchParams.set("page_size", String(limit));
  const userAgent = options.userAgent ?? process.env.OPENVERSE_USER_AGENT ?? DEFAULT_USER_AGENT;
  const response = await fetchWithRetry(url, { headers: { "User-Agent": userAgent, Accept: "application/json" } });
  const json = await response.json();
  return (json.results ?? []).map(openverseResultToCandidate).filter(Boolean);
}

export const openverseImageConstants = {
  OPENVERSE_API,
  ALLOWED_LICENSES,
};
