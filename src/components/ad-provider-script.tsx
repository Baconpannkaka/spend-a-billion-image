import { adConfig } from "@/config/ads";
import Script from "next/script";

export function AdProviderScript() {
  if (!adConfig.enabled || adConfig.provider !== "adsense" || !adConfig.adsenseClientId) return null;
  return <Script async strategy="afterInteractive" crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adConfig.adsenseClientId)}`} />;
}
