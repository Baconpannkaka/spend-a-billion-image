import { AdSlot } from "@/components/ad-slot";
import { adConfig, type AdPlacement } from "@/config/ads";

export function AdPageLayout({ children, railPlacement = "shop-rail" }: { children: React.ReactNode; railPlacement?: Extract<AdPlacement, "shop-rail" | "result-rail"> }) {
  const hasRail = adConfig.enabled || adConfig.showPlaceholdersWhenDisabled;
  if (!hasRail) return <>{children}</>;
  return <div className="ad-page-layout"><div className="min-w-0">{children}</div><div className="ad-rail"><AdSlot placement={railPlacement} /></div></div>;
}
