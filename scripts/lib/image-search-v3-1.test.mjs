import { describe, expect, it } from "vitest";
import {
  IMAGE_SEARCH_VERSION,
  filterAndRankCandidates,
  rankCandidatesWithDiagnostics,
} from "./image-search-v3-1.mjs";

function candidate(title, extra = {}) {
  return {
    title,
    mime: "image/jpeg",
    width: 1400,
    height: 900,
    downloadUrl: "https://example.com/image.jpg",
    originalUrl: "https://example.com/original.jpg",
    sourceUrl: "https://example.com/source",
    sourceType: "commons",
    provider: "Wikimedia Commons",
    metadata: {
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      creator: "Photographer",
      description: "",
      credit: "",
      attribution: "",
    },
    ...extra,
  };
}

function openverse(title, description = "") {
  return candidate(title, {
    sourceType: "openverse",
    provider: "flickr",
    source: "flickr",
    metadata: {
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      creator: "Photographer",
      description,
      credit: "flickr",
      attribution: "",
    },
  });
}

describe("Bildsök v3.2", () => {
  it("har en ny sökversion så v3.1 no-match kan prövas igen", () => {
    expect(IMAGE_SEARCH_VERSION).toBe(3.2);
  });

  it("stoppar Fairphone-lifestylebilder trots korrekt produktnamn", () => {
    const product = { name: "Fairphone 5", brand: "Fairphone", categoryId: "mobil" };
    expect(filterAndRankCandidates(product, [openverse("Fairphone 5 Lifestyle")])).toHaveLength(0);
  });

  it("stoppar fel Zenbook-generation", () => {
    const product = { name: "ASUS Zenbook S 14", brand: "ASUS", categoryId: "datorer" };
    const wrong = openverse("[ADAYROI-T9] LAPTOP ASUS ZENBOOK UX410UA-GV109 14 INCHES");
    expect(filterAndRankCandidates(product, [wrong])).toHaveLength(0);
  });

  it("stoppar bilder tagna med GoPro när kameran inte är motivet", () => {
    const product = { name: "GoPro HERO13 Black", brand: "GoPro", categoryId: "kameror" };
    const road = candidate("File:Mapillary road photo taken with GoPro HERO13 Black.jpg");
    expect(filterAndRankCandidates(product, [road])).toHaveLength(0);
  });

  it("stoppar Xbox One-event för Xbox Series X", () => {
    const product = { name: "Xbox Series X", brand: "Microsoft", categoryId: "gaming" };
    const wrong = candidate("File:Xbox One Launch - Supercar Rides.jpg", {
      metadata: {
        license: "CC BY 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
        creator: "X",
        description: "Microsoft Xbox One launch event",
        credit: "",
        attribution: "",
      },
    });
    expect(filterAndRankCandidates(product, [wrong])).toHaveLength(0);
  });

  it("kräver mått när produktnamnet anger 24 cm", () => {
    const product = { name: "Staub Cocotte 24 cm", brand: "Staub", categoryId: "kok" };
    const wrongSize = candidate("File:2019 cocotte Staub en fonte émaillée tomate.jpg");
    expect(filterAndRankCandidates(product, [wrongSize])).toHaveLength(0);
  });

  it("stoppar generisk hamnbild för Sunseeker 100 Yacht", () => {
    const product = { name: "Sunseeker 100 Yacht", brand: "Sunseeker", categoryId: "yachter" };
    const harbour = openverse("Poole Harbour - Variety of Watercraft #1");
    expect(filterAndRankCandidates(product, [harbour])).toHaveLength(0);
  });

  it("kan fortfarande acceptera en tydlig Adidas Ultraboost-bild utan exakt generationsnummer", () => {
    const product = { name: "Adidas Ultraboost 5", brand: "Adidas", categoryId: "skor" };
    const shoe = openverse("ADIDAS ULTRABOOST JAPAN FEATURING FIREWORKS", "Adidas Ultraboost running shoe product photograph");
    expect(filterAndRankCandidates(product, [shoe])).toHaveLength(1);
  });

  it("rapporterar separata kontext- och identitetsfilter", () => {
    const product = { name: "Fairphone 5", brand: "Fairphone", categoryId: "mobil" };
    const good = candidate("Fairphone 5 front product photo");
    const lifestyle = openverse("Fairphone 5 Lifestyle");
    const { ranked, diagnostics } = rankCandidatesWithDiagnostics(product, [good, lifestyle]);
    expect(ranked).toHaveLength(1);
    expect(diagnostics.raw).toBe(2);
    expect(diagnostics.filteredByContext).toBe(1);
  });
});
