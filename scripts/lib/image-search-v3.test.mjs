import { describe, expect, it } from "vitest";
import { filterAndRankCandidates, isSmartAutoApproveCandidate } from "./image-search-v3.mjs";
import { openverseResultToCandidate } from "./openverse-images.mjs";

const product = { name: "Nintendo Switch OLED", brand: "Nintendo", categoryId: "gaming" };

function commonsCandidate(title) {
  return {
    title,
    mime: "image/jpeg",
    width: 1600,
    height: 1000,
    downloadUrl: "https://upload.wikimedia.org/example.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:example.jpg",
    sourceType: "commons",
    provider: "Wikimedia Commons",
    metadata: { license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", creator: "A", description: "" },
  };
}

describe("Bildsök v3", () => {
  it("mappar Openverse-resultat med originalkälla och licens", () => {
    const candidate = openverseResultToCandidate({
      id: "abc-123",
      title: "Nintendo Switch OLED",
      foreign_landing_url: "https://www.flickr.com/photos/example/123",
      url: "https://example.test/original.jpg",
      creator: "Photographer",
      license: "by-sa",
      license_version: "4.0",
      license_url: "https://creativecommons.org/licenses/by-sa/4.0/",
      provider: "flickr",
      source: "flickr",
      filetype: "jpg",
      width: 2000,
      height: 1200,
      tags: [{ name: "Nintendo" }],
    });
    expect(candidate.sourceType).toBe("openverse");
    expect(candidate.sourceUrl).toContain("flickr.com");
    expect(candidate.metadata.license).toBe("CC BY-SA 4.0");
    expect(candidate.downloadUrl).toContain("api.openverse.org/v1/images/abc-123/thumb/");
  });

  it("filtrerar bort Wikimedia-dubbletter från Openverse", () => {
    expect(openverseResultToCandidate({
      id: "x",
      title: "Example",
      foreign_landing_url: "https://commons.wikimedia.org/wiki/File:Example.jpg",
      url: "https://example.test/a.jpg",
      provider: "wikimedia",
      license: "by",
    })).toBeNull();
  });

  it("auto-godkänner bara mycket säker exakt Commons-träff", () => {
    const ranked = filterAndRankCandidates(product, [commonsCandidate("File:Nintendo Switch OLED.jpg")]);
    expect(ranked[0].score).toBeGreaterThanOrEqual(138);
    expect(isSmartAutoApproveCandidate(product, ranked[0])).toBe(true);
    expect(isSmartAutoApproveCandidate(product, { ...ranked[0], sourceType: "openverse" })).toBe(false);
  });
});
