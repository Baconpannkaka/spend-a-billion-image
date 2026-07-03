"use client";

import { AdSlot } from "@/components/ad-slot";
import { useLanguage } from "@/i18n/language-context";
import { ArrowRight, Crown, ShoppingBasket, Sparkles, Tags } from "lucide-react";
import Link from "next/link";

export function ModeLanding() {
  const { t } = useLanguage();
  return (
    <>
      <section className="hero-luxury relative overflow-hidden border-b border-white/10 py-16 md:py-24">
        <div className="hero-grain pointer-events-none absolute inset-0 opacity-40" />
        <div className="shell relative">
          <p className="eyebrow">{t("landing.eyebrow")}</p>
          <h1 className="mt-4 max-w-5xl font-display text-5xl leading-[.92] text-white md:text-7xl xl:text-8xl">{t("landing.title")}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 md:text-lg">{t("landing.intro")}</p>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Link href="/miljardar" className="mode-card group bg-[#171713]">
              <div className="flex items-start justify-between gap-4"><div className="icon-tile"><Crown className="h-6 w-6" /></div><span className="pill">{t("landing.products")}</span></div>
              <div className="mt-16 md:mt-24"><p className="eyebrow">{t("landing.luxury")}</p><h2 className="mt-2 font-display text-4xl text-white md:text-5xl">{t("landing.luxuryTitle")}</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/55">{t("landing.luxuryCopy")}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[var(--gold)]">{t("landing.chooseWealth")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div>
            </Link>
            <Link href="/vardag" className="mode-card mode-card-everyday group bg-[var(--paper)] text-[#15140f]">
              <div className="flex items-start justify-between gap-4"><div className="icon-tile border-black/15 bg-black/5 text-[#15140f]"><ShoppingBasket className="h-6 w-6" /></div><span className="pill border-black/15 bg-black/5 text-black/65">{t("landing.products")}</span></div>
              <div className="mt-16 md:mt-24"><p className="eyebrow text-[var(--gold-dark)]">{t("landing.everyday")}</p><h2 className="mt-2 font-display text-4xl text-[#15140f] md:text-5xl">{t("landing.everydayTitle")}</h2><p className="mt-4 max-w-xl text-sm leading-6 text-black/65">{t("landing.everydayCopy")}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#15140f]">{t("landing.chooseBudget")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div>
            </Link>
          </div>
          <AdSlot placement="home-banner" className="mt-8" />
        </div>
      </section>
      <section className="bg-[var(--paper)] py-14 text-[var(--ink)]"><div className="shell grid gap-8 md:grid-cols-3"><div><Sparkles className="h-5 w-5 text-[var(--gold-dark)]" /><h2 className="mt-3 font-display text-3xl">{t("landing.dreamTitle")}</h2><p className="mt-2 text-sm leading-6 text-black/55">{t("landing.dreamCopy")}</p></div><div><Tags className="h-5 w-5 text-[var(--gold-dark)]" /><h2 className="mt-3 font-display text-3xl">{t("landing.searchTitle")}</h2><p className="mt-2 text-sm leading-6 text-black/55">{t("landing.searchCopy")}</p></div><div><ArrowRight className="h-5 w-5 text-[var(--gold-dark)]" /><h2 className="mt-3 font-display text-3xl">{t("landing.shareTitle")}</h2><p className="mt-2 text-sm leading-6 text-black/55">{t("landing.shareCopy")}</p></div></div></section>
    </>
  );
}
