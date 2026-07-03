"use client";

import { useGame } from "@/context/game-context";
import { useLanguage } from "@/i18n/language-context";
import { formatMoneyFromSek } from "@/lib/format";
import { Check, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function CheckoutClient() {
  const router = useRouter();
  const { hydrated, cart, name, setName, total, currency, completePurchase, mode } = useGame();
  const { t, locale } = useLanguage();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const statuses = useMemo(() => [t("checkout.status1"), t("checkout.status2"), t("checkout.status3"), t("checkout.status4")], [t]);

  useEffect(() => {
    if (!running) return;
    if (step >= statuses.length) {
      completePurchase();
      const timer = window.setTimeout(() => router.push("/resultat"), 450);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setStep((current) => current + 1), 650);
    return () => window.clearTimeout(timer);
  }, [running, step, statuses.length, completePurchase, router]);

  if (!hydrated) return <div className="shell min-h-[65vh] py-12"><div className="h-80 animate-pulse rounded-xl bg-white/5" /></div>;
  if (cart.length === 0) return <section className="bg-[var(--paper)] py-24 text-center text-[var(--ink)]"><div className="shell max-w-xl"><h1 className="font-display text-5xl">{t("checkout.empty")}</h1><p className="mt-4 text-black/55">{t("checkout.emptyCopy")}</p><Link href="/shop" className="primary-button mt-6">{t("nav.shop")}</Link></div></section>;

  return <section className="bg-[var(--paper)] py-10 text-[var(--ink)]"><div className="shell max-w-5xl"><div className="grid gap-7 lg:grid-cols-[1fr_.9fr] lg:items-start"><div><p className="eyebrow text-[var(--gold-dark)]">{t("checkout.lastStep")}</p><h1 className="mt-2 font-display text-5xl">{t("checkout.title")}</h1><p className="mt-4 max-w-xl text-sm leading-7 text-black/55">{t("checkout.copy")}</p><label className="field-label mt-6 block max-w-md">{t("checkout.resultName")}<input value={name} onChange={(event) => setName(event.target.value)} className="field mt-1.5" placeholder="Future Shopper" /></label><div className="mt-6 rounded-xl border border-black/10 bg-white p-5"><div className="flex justify-between gap-4"><span className="text-sm text-black/50">{t("checkout.mode")}</span><strong>{mode === "luxury" ? t("landing.luxury") : t("landing.everyday")}</strong></div><div className="mt-3 flex justify-between gap-4"><span className="text-sm text-black/50">{t("checkout.order")}</span><strong>{formatMoneyFromSek(total, currency, locale)}</strong></div></div></div><div className="rounded-2xl bg-[#11110f] p-6 text-white shadow-2xl"><div className="flex items-center justify-between"><p className="text-xs font-bold tracking-[.2em] text-[var(--gold)]">BILLIONAIRE BLACK</p><LockKeyhole className="h-5 w-5 text-white/45" /></div><p className="mt-16 font-mono text-xl tracking-[.16em]">4242 4242 4242 4242</p><div className="mt-8 grid grid-cols-[1fr_auto_auto] gap-4 text-xs"><div><p className="text-white/35">{t("checkout.holder").toUpperCase()}</p><p className="mt-1 font-semibold">{name || "Future Shopper"}</p></div><div><p className="text-white/35">{t("checkout.valid").toUpperCase()}</p><p className="mt-1 font-semibold">12/99</p></div><div><p className="text-white/35">CVC</p><p className="mt-1 font-semibold">000</p></div></div><button type="button" disabled={running} onClick={() => { setStep(0); setRunning(true); }} className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--gold)] px-4 font-bold text-black disabled:opacity-60">{running ? <><LoaderCircle className="h-4 w-4 animate-spin" /> {statuses[Math.min(step, statuses.length - 1)]}</> : <><Check className="h-4 w-4" /> {t("checkout.submit")}</>}</button></div></div></div></section>;
}
