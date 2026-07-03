"use client";

import { adConfig, type AdPlacement } from "@/config/ads";
import { useLanguage } from "@/i18n/language-context";
import { useEffect, useRef } from "react";

declare global {
  interface Window { adsbygoogle?: unknown[]; }
}

const sizes: Record<AdPlacement, string> = {
  "home-banner": "min-h-[90px] w-full",
  "shop-rail": "min-h-[600px] w-[160px]",
  "shop-inline": "min-h-[180px] w-full",
  "result-rail": "min-h-[280px] w-full",
};

export function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  const pushed = useRef(false);
  const { t } = useLanguage();
  const slot = adConfig.slots[placement];
  const active = adConfig.enabled && adConfig.provider === "adsense" && Boolean(adConfig.adsenseClientId && slot);

  useEffect(() => {
    if (!active || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
      pushed.current = true;
    } catch {
      // Annonsytan lämnas tom om leverantörens skript blockeras.
    }
  }, [active]);

  if (!active && !adConfig.showPlaceholdersWhenDisabled) return null;
  if (!active) return <aside aria-label={t("ad.label")} className={`${sizes[placement]} ${className} grid place-items-center rounded-md border border-dashed border-black/15 bg-black/[.025] text-[10px] font-bold uppercase tracking-[.16em] text-black/30`}>{t("ad.label")}</aside>;

  return (
    <aside aria-label={t("ad.label")} className={`${sizes[placement]} ${className}`}>
      <ins className="adsbygoogle block h-full w-full" style={{ display: "block" }} data-ad-client={adConfig.adsenseClientId} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
