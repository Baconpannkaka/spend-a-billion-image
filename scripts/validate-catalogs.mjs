import { readFile } from "node:fs/promises";
import path from "node:path";

const allowedQuality = new Set(["verified", "curated", "generated"]);
const allowedPriceTypes = new Set(["official-retail", "market-estimate", "fantasy-estimate"]);

for (const mode of ["luxury", "everyday"]) {
  const filename = path.join(process.cwd(), "public", "data", `catalog-${mode}.json`);
  const catalog = JSON.parse(await readFile(filename, "utf8"));
  if (catalog.mode !== mode || catalog.productCount !== 10_000 || catalog.products.length !== 10_000) throw new Error(`${mode}: katalogen måste innehålla exakt 10 000 produkter.`);
  const ids = new Set();
  const officialNames = new Set();
  const stats = { verified: 0, curated: 0, generated: 0 };
  for (const product of catalog.products) {
    if (!product.id || ids.has(product.id)) throw new Error(`${mode}: dubbelt eller tomt produkt-id.`);
    ids.add(product.id);
    if (product.mode !== mode || !product.name || !product.categoryId || !product.subcategoryId || !Number.isFinite(product.priceSek) || product.priceSek <= 0) throw new Error(`${mode}: ogiltig produkt ${product.id}.`);
    if (!allowedQuality.has(product.dataQuality)) throw new Error(`${mode}: ogiltig datakvalitet för ${product.id}.`);
    if (!allowedPriceTypes.has(product.priceType)) throw new Error(`${mode}: ogiltig pristyp för ${product.id}.`);
    stats[product.dataQuality] += 1;
    if (product.dataQuality === "verified") {
      const key = `${product.brand ?? ""}|${product.name}`.toLocaleLowerCase("en");
      if (officialNames.has(key)) throw new Error(`${mode}: dubblerad verifierad produkt ${product.name}.`);
      officialNames.add(key);
      if (!Array.isArray(product.sourceUrls) || product.sourceUrls.length === 0) throw new Error(`${mode}: verifierad produkt saknar källa: ${product.name}.`);
    }
    if (product.nameKind === "translatable" && (!product.localizations || !product.localizations.en?.name)) throw new Error(`${mode}: översättbart namn saknar engelsk version: ${product.name}.`);
  }
  if (catalog.categories.length < 15) throw new Error(`${mode}: för få huvudkategorier.`);
  if (JSON.stringify(stats) !== JSON.stringify(catalog.qualityStats)) throw new Error(`${mode}: qualityStats stämmer inte.`);
  console.log(`${mode}: ${catalog.products.length} produkter, ${stats.verified} verifierade, ${stats.curated} kurerade och ${stats.generated} genererade godkända.`);
}
