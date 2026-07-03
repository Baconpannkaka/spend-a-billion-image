import { getSiteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const routes = ["", "/miljardar", "/vardag", "/shop", "/produkt", "/varukorg", "/kassa", "/resultat", "/sa-fungerar-det", "/om", "/bildkallor", "/juridiskt"];
  return routes.map((route) => ({ url: `${base}${route}`, changeFrequency: "monthly" as const, priority: route === "" ? 1 : 0.7 }));
}
