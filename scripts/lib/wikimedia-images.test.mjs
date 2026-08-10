import { describe, expect, it } from "vitest";
import {
  buildSearchQueries,
  confidenceFromScore,
  filterAndRankCandidates,
  isAllowedLicense,
  metadataFromImageInfo,
  scoreCandidate,
  stripHtml,
} from "./wikimedia-images.mjs";

const product = { name: "Bugatti Tourbillon", brand: "Bugatti", categoryId: "fordon" };
const candidate = (title, extra = {}) => ({
  title,
  mime: "image/jpeg",
  width: 1600,
  height: 1000,
  downloadUrl: "https://upload.wikimedia.org/example.jpg",
  sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
  metadata: { license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", creator: "Photographer", description: "" },
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
    const logo = scoreCandidate(product, candidate("File:Bugatti Tourbillon logo.png", { mime: "image/png" }));
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

  it("skapar en förenklad fallback för produktnamn med storlek eller gradering", () => {
    const queries = buildSearchQueries({ name: "Dior Lady Dior Medium", brand: "Dior", categoryId: "mode" });
    expect(queries.length).toBeGreaterThan(3);
    expect(queries.some((query) => query.includes('"Lady Dior"') && query.includes("Dior"))).toBe(true);
  });

  it("ger en ren exakt elektronikmodell high confidence", () => {
    const item = { name: "iPhone 17 Pro Max", brand: "Apple", categoryId: "teknik" };
    const score = scoreCandidate(item, candidate("File:Apple iPhone 17 Pro Max.jpg"));
    expect(score).toBeGreaterThanOrEqual(118);
    expect(confidenceFromScore(score)).toBe("high");
  });

  it("blandar inte ihop Samsung Galaxy S25+ med S25 Ultra", () => {
    const item = { name: "Samsung Galaxy S25+", brand: "Samsung", categoryId: "elektronik" };
    const ranked = filterAndRankCandidates(item, [candidate("File:Samsung Galaxy S25 Ultra.jpg")]);
    expect(ranked).toHaveLength(0);
  });

  it("håller en närliggande elektronikvariant under high confidence", () => {
    const item = { name: "Samsung Galaxy S25", brand: "Samsung", categoryId: "elektronik" };
    const score = scoreCandidate(item, candidate("File:Samsung Galaxy S25 Ultra.jpg"));
    expect(score).toBeLessThan(118);
  });

  it("straffar detaljbilder av motor jämfört med en normal produktbild", () => {
    const item = { name: "Pagani Huayra Roadster BC", brand: "Pagani", categoryId: "fordon" };
    const normal = scoreCandidate(item, candidate("File:Pagani Huayra Roadster BC front view.jpg"));
    const engine = scoreCandidate(item, candidate("File:Pagani Huayra Roadster BC engine left side.jpg"));
    expect(normal - engine).toBeGreaterThanOrEqual(30);
    expect(confidenceFromScore(engine)).not.toBe("high");
  });

  it("kan använda lärd negativ feedback för att sänka en kandidats poäng", () => {
    const item = { name: "Apple iPhone 17", brand: "Apple", categoryId: "teknik" };
    const image = candidate("File:Apple iPhone 17 product launch event.jpg");
    const withoutFeedback = scoreCandidate(item, image);
    const withFeedback = scoreCandidate(item, image, { learnedBadTerms: ["launch event"] });
    expect(withFeedback).toBeLessThan(withoutFeedback);
  });
});
