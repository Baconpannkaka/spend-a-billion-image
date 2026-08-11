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

describe("Bildsök v3.1", () => {
  it("har en ny sökversion så v3 no-match kan prövas igen", () => {
    expect(IMAGE_SEARCH_VERSION).toBe(3.1);
  });

  it("stoppar en gammal Zenbook-modell när målprodukten är S 14", () => {
    const product = { name: "ASUS Zenbook S 14", brand: "ASUS", categoryId: "datorer" };
    const ranked = filterAndRankCandidates(product, [candidate("File:ASUS Zenbook UX31E Ultrabook & Accessories.jpg")]);
    expect(ranked).toHaveLength(0);
  });

  it("kan acceptera en relevant Openverse-träff när modellnamnet finns i metadata", () => {
    const product = { name: "Fairphone 5", brand: "Fairphone", categoryId: "mobil" };
    const openverse = candidate("Product photograph", {
      sourceType: "openverse",
      provider: "flickr",
      source: "flickr",
      metadata: {
        license: "CC BY 2.0",
        licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
        creator: "Photographer",
        description: "Fairphone 5 smartphone front view",
        credit: "flickr",
        attribution: "",
      },
    });
    const ranked = filterAndRankCandidates(product, [openverse]);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].sourceType).toBe("openverse");
  });

  it("filtrerar bort Openverse-resultat som bara matchar varumärket", () => {
    const product = { name: "ASUS Zenbook S 14", brand: "ASUS", categoryId: "datorer" };
    const unrelated = candidate("ASUS laptop on desk", {
      sourceType: "openverse",
      metadata: {
        license: "CC BY 2.0",
        licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
        creator: "X",
        description: "ASUS laptop computer",
        credit: "",
        attribution: "",
      },
    });
    const ranked = filterAndRankCandidates(product, [unrelated]);
    expect(ranked).toHaveLength(0);
  });

  it("rapporterar hur många kandidater som försvinner före och efter rankning", () => {
    const product = { name: "Fairphone 5", brand: "Fairphone", categoryId: "mobil" };
    const good = candidate("Fairphone 5 front");
    const badLicense = candidate("Fairphone 5", {
      sourceUrl: "https://example.com/nc",
      metadata: {
        license: "CC BY-NC 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/",
        creator: "X",
        description: "Fairphone 5",
      },
    });
    const { ranked, diagnostics } = rankCandidatesWithDiagnostics(product, [good, badLicense]);
    expect(ranked).toHaveLength(1);
    expect(diagnostics.raw).toBe(2);
    expect(diagnostics.licenseEligible).toBe(1);
    expect(diagnostics.filteredBeforeRanking).toBe(1);
  });
});
