import { ProductPlaceholder } from "@/components/product-placeholder";
import { LanguageProvider } from "@/i18n/language-context";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const baseProduct = {
  id: "everyday-1",
  mode: "everyday" as const,
  slug: "mobil",
  name: "Mobil",
  categoryId: "mobil",
  categoryLabel: "Mobil",
  subcategoryId: "smartphones",
  subcategoryLabel: "Smartphones",
  priceSek: 100,
  shortDescription: "",
  description: "",
  facts: [],
  tags: [],
};

describe("product placeholder", () => {
  it("renderar en kategoribild när en mappning finns", () => {
    render(
      <LanguageProvider>
        <ProductPlaceholder product={baseProduct} />
      </LanguageProvider>,
    );
    expect(screen.getByRole("img", { name: /Mobil: Smartphones .* illustrationsbild/ })).toBeInTheDocument();
  });

  it("behåller den generiska fallbacken för okända kategorier", () => {
    render(
      <LanguageProvider>
        <ProductPlaceholder product={{ ...baseProduct, categoryId: "okand", categoryLabel: "Okänd" }} />
      </LanguageProvider>,
    );
    expect(screen.getByText("Mobil")).toBeInTheDocument();
    expect(screen.getByText(/everyday-1/)).toBeInTheDocument();
  });
});
