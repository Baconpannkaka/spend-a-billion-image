"use client";

import { useLanguage } from "@/i18n/language-context";
import Link from "next/link";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-white/10 bg-[#090908] py-10">
      <div className="shell grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div><p className="font-display text-2xl">Spend a Billion</p><p className="mt-2 max-w-xl text-sm leading-6 text-white/45">{t("footer.copy")}</p></div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55"><Link href="/juridiskt">{t("footer.legal")}</Link><Link href="/bildkallor">{t("footer.images")}</Link><Link href="/om">{t("footer.about")}</Link></div>
      </div>
    </footer>
  );
}
