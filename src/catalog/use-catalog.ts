"use client";

import { useCatalogContext } from "@/catalog/catalog-context";
import type { GameMode } from "@/types";
import { useEffect } from "react";

export function useCatalog(mode: GameMode) {
  const context = useCatalogContext();
  const catalog = context.catalogs[mode];
  const state = context.states[mode];

  useEffect(() => {
    if (!catalog && state !== "loading") void context.ensureCatalog(mode);
  }, [catalog, context, mode, state]);

  return {
    catalog,
    state,
    ensureCatalog: context.ensureCatalog,
    getImage: context.getImage,
  };
}
