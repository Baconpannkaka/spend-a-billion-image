export type AdPlacement = "home-banner" | "shop-rail" | "shop-inline" | "result-rail";

export const adConfig = {
  enabled: false,
  provider: "adsense" as "adsense" | "none",
  adsenseClientId: "",
  showPlaceholdersWhenDisabled: false,
  slots: {
    "home-banner": "",
    "shop-rail": "",
    "shop-inline": "",
    "result-rail": "",
  } satisfies Record<AdPlacement, string>,
};
