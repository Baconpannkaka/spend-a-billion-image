"use client";

import { CatalogProvider } from "@/catalog/catalog-context";
import { LanguageProvider } from "@/i18n/language-context";
import { GameProvider } from "@/context/game-context";
import { ToastProvider } from "@/context/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ToastProvider>
      <CatalogProvider>
        <GameProvider>{children}</GameProvider>
      </CatalogProvider>
    </ToastProvider>
    </LanguageProvider>
  );
}
