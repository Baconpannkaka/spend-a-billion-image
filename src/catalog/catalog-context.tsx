"use client";

import { withBasePath } from "@/lib/assets";
import type { GameMode, ImageManifest, Product, ProductCatalog, ProductImageRecord } from "@/types";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type LoadState = "idle" | "loading" | "ready" | "error";

type CatalogContextValue = {
  catalogs: Partial<Record<GameMode, ProductCatalog>>;
  states: Record<GameMode, LoadState>;
  ensureCatalog: (mode: GameMode) => Promise<ProductCatalog>;
  getProduct: (mode: GameMode, productId: string) => Product | undefined;
  getImage: (productId: string) => ProductImageRecord | undefined;
  imageManifestReady: boolean;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

function isCatalog(value: unknown, mode: GameMode): value is ProductCatalog {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProductCatalog>;
  return candidate.mode === mode && Array.isArray(candidate.products) && Array.isArray(candidate.categories) && candidate.productCount === 10_000;
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [catalogs, setCatalogs] = useState<Partial<Record<GameMode, ProductCatalog>>>({});
  const [states, setStates] = useState<Record<GameMode, LoadState>>({ luxury: "idle", everyday: "idle" });
  const [imageManifest, setImageManifest] = useState<ImageManifest>({ version: 1, generatedAt: "", images: [] });
  const [imageManifestReady, setImageManifestReady] = useState(false);
  const catalogPromises = useRef<Partial<Record<GameMode, Promise<ProductCatalog>>>>({});
  const imagePromise = useRef<Promise<void> | null>(null);

  const ensureImages = useCallback(async () => {
    if (imageManifestReady) return;
    if (!imagePromise.current) {
      imagePromise.current = fetch(withBasePath("/data/image-manifest.json"), { cache: "force-cache" })
        .then(async (response) => {
          if (!response.ok) throw new Error("Kunde inte läsa bildmanifestet.");
          const parsed: unknown = await response.json();
          if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as Partial<ImageManifest>).images)) {
            throw new Error("Bildmanifestet har fel format.");
          }
          setImageManifest(parsed as ImageManifest);
        })
        .catch(() => setImageManifest({ version: 1, generatedAt: "", images: [] }))
        .finally(() => setImageManifestReady(true));
    }
    await imagePromise.current;
  }, [imageManifestReady]);

  const ensureCatalog = useCallback(async (mode: GameMode) => {
    const existing = catalogs[mode];
    if (existing) return existing;
    if (catalogPromises.current[mode]) return catalogPromises.current[mode];

    setStates((current) => ({ ...current, [mode]: "loading" }));
    const promise = Promise.all([
      fetch(`${withBasePath("/data/image-manifest.json")}?v=${Date.now()}`, {
  cache: "no-store",
}),
      ensureImages(),
    ])
      .then(async ([response]) => {
        if (!response.ok) throw new Error(`Kunde inte ladda katalogen (${response.status}).`);
        const parsed: unknown = await response.json();
        if (!isCatalog(parsed, mode)) throw new Error("Produktkatalogen har fel format.");
        setCatalogs((current) => ({ ...current, [mode]: parsed }));
        setStates((current) => ({ ...current, [mode]: "ready" }));
        return parsed;
      })
      .catch((error: unknown) => {
        setStates((current) => ({ ...current, [mode]: "error" }));
        delete catalogPromises.current[mode];
        throw error;
      });

    catalogPromises.current[mode] = promise;
    return promise;
  }, [catalogs, ensureImages]);

  const productMaps = useMemo(() => {
    const result: Partial<Record<GameMode, Map<string, Product>>> = {};
    for (const mode of ["luxury", "everyday"] as const) {
      const catalog = catalogs[mode];
      if (catalog) result[mode] = new Map(catalog.products.map((product) => [product.id, product]));
    }
    return result;
  }, [catalogs]);

  const imageMap = useMemo(
    () => new Map(imageManifest.images.filter((image) => image.status === "approved").map((image) => [image.productId, image])),
    [imageManifest],
  );

  const getProduct = useCallback((mode: GameMode, productId: string) => productMaps[mode]?.get(productId), [productMaps]);
  const getImage = useCallback((productId: string) => imageMap.get(productId), [imageMap]);

  const value = useMemo<CatalogContextValue>(() => ({
    catalogs,
    states,
    ensureCatalog,
    getProduct,
    getImage,
    imageManifestReady,
  }), [catalogs, states, ensureCatalog, getProduct, getImage, imageManifestReady]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalogContext() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalogContext måste användas inom CatalogProvider");
  return context;
}
