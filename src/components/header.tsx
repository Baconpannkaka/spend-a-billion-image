"use client";

import { CurrencySelect } from "@/components/currency-select";
import { LanguageSelect } from "@/components/language-select";
import { MoneyDisplay } from "@/components/money-display";
import { useGame } from "@/context/game-context";
import { useLanguage } from "@/i18n/language-context";
import { Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);
  const { hasStarted, remaining, currency, totalQuantity } = useGame();
  const { t } = useLanguage();
  const nav = [
    ["/", t("nav.start")],
    ["/shop", t("nav.shop")],
    ["/sa-fungerar-det", t("nav.how")],
    ["/om", t("nav.about")],
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(10,10,9,.94)] backdrop-blur-xl">
      <div className="shell flex min-h-16 items-center justify-between gap-3 py-2">
        <Link href="/" className="focus-ring shrink-0 font-display text-lg tracking-wide text-white sm:text-xl">SPEND A <span className="text-[var(--gold)]">BILLION</span></Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Huvudmeny">
          {nav.map(([href, label]) => <Link key={href} href={href} className="text-sm text-white/60 transition hover:text-white">{label}</Link>)}
        </nav>
        <div className="flex min-w-0 items-center gap-2">
          {hasStarted && <div className="hidden min-w-0 text-right xl:block"><p className="text-[10px] uppercase tracking-[.14em] text-white/35">{t("header.remaining")}</p><p className="max-w-[30rem] truncate text-xs font-semibold text-white 2xl:text-sm"><MoneyDisplay valueSek={remaining} currency={currency} compactClassName="text-white/45 font-normal" /></p></div>}
          <LanguageSelect />
          <CurrencySelect compact />
          <Link href="/varukorg" className="focus-ring relative inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-white/15 px-3 text-sm font-semibold text-white hover:bg-white/5">
            <ShoppingBag className="h-4 w-4" /><span className="hidden sm:inline">{t("header.cart")}</span>
            {totalQuantity > 0 && <span className="min-w-5 rounded-full bg-[var(--gold)] px-1.5 py-0.5 text-center text-[10px] font-bold text-black">{totalQuantity > 999 ? "999+" : totalQuantity}</span>}
          </Link>
          <button type="button" aria-label={open ? t("header.closeMenu") : t("header.openMenu")} onClick={() => setOpen((value) => !value)} className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 text-white lg:hidden">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        </div>
      </div>
      {open && <nav className="border-t border-white/10 bg-[#0d0d0b] px-4 py-3 lg:hidden" aria-label="Mobilmeny">{nav.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-semibold text-white/75 hover:bg-white/5 hover:text-white">{label}</Link>)}</nav>}
    </header>
  );
}
