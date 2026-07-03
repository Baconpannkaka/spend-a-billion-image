import { describe, expect, it } from "vitest";
import { buildSearchQueries, confidenceFromScore, filterAndRankCandidates, isAllowedLicense, metadataFromImageInfo, scoreCandidate, stripHtml } from "./wikimedia-images.mjs";

const product = { name: "Bugatti Tourbillon", brand: "Bugatti", categoryId: "fordon" };
const candidate = (title, extra = {}) => ({
  title,
  mime: "image/jpeg",
  width: 1600,
  height: 1000,
  downloadUrl: "https://upload.wikimedia.org/example.jpg",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
  metadata: { license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", creator: "Photographer", description: "Bugatti Tourbillon car" },
  ...extra,
});

describe("Wikimedia image utilities", () => {
  it("accepterar fria licenser men stoppar NC och ND", () => {
    expect(isAllowedLicense("CC BY 4.0")).toBe(true);
    expect(isAllowedLicense("CC BY-SA 3.0")).toBe(true);
    expect(isAllowedLicense("CC0 1.0")).toBe(true);
    expect(isAllowedLicense("Public domain")).toBe(true);
    expect(isAllowedLicense("CC BY-NC 4.0")).toBe(false);
    expect(isAllowedLicense("CC BY-ND 4.0")).toBe(false);
  });

  it("rensar Commons HTML-metadata", () => {
    expect(stripHtml('<a href="x">Jane Doe</a><br>Photo')).toBe("Jane Doe Photo");
    const metadata = metadataFromImageInfo({ extmetadata: { Artist: { value: "<b>Jane Doe</b>" }, LicenseShortName: { value: "CC BY 4.0" } } });
    expect(metadata.creator).toBe("Jane Doe");
    expect(metadata.license).toBe("CC BY 4.0");
  });

  it("rankar en riktig produktbild högre än en logotyp", () => {
    const photo = scoreCandidate(product, candidate("File:Bugatti Tourbillon 2026.jpg"));
    const logo = scoreCandidate(product, candidate("File:Bugatti Tourbillon logo.svg", { mime: "image/png" }));
    expect(photo).toBeGreaterThan(logo);
    expect(confidenceFromScore(photo)).toBe("high");
  });

  it("filtrerar bort otillåtna licenser", () => {
    const ranked = filterAndRankCandidates(product, [
      candidate("File:Bugatti Tourbillon.jpg"),
      candidate("File:Bugatti Tourbillon commercial.jpg", { metadata: { license: "CC BY-NC 4.0", licenseUrl: "", creator: "X", description: "Bugatti Tourbillon" } }),
    ]);
    expect(ranked).toHaveLength(1);
  });

  it("skapar flera sökfrågor och respekterar overrides", () => {
    expect(buildSearchQueries(product)[0]).toContain('"Bugatti Tourbillon"');
    expect(buildSearchQueries(product, "custom query")).toEqual(["custom query"]);
  });
});
