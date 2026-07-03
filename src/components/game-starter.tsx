"use client";

import { useGame } from "@/context/game-context";
import { useLanguage } from "@/i18n/language-context";
import { currencies, currencyToSek } from "@/data/currencies";
import { wealthProfiles } from "@/data/wealth-profiles";
import { createClassicSetup, createCustomSetup, createPersonSetup, createPresetSetup, createStockSetup } from "@/lib/budget";
import { formatCompactMoneyFromSek, formatMoneyFromSek } from "@/lib/format";
import type { CurrencyCode, GameMode, GameSetup } from "@/types";
import { ArrowRight, BarChart3, Coins, Crown, LoaderCircle, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const everydayPresets = [
  { id: "veckopeng", label: "Veckopeng", amount: 500, copy: "Små val blir plötsligt väldigt viktiga." },
  { id: "presentkort", label: "Presentkort", amount: 2_000, copy: "En lagom spontan shoppingrunda." },
  { id: "loningshelg", label: "Löningshelg", amount: 10_000, copy: "Lite ansvar, ganska mycket frestelse." },
  { id: "semesterkassa", label: "Semesterkassa", amount: 30_000, copy: "Resa, prylar eller en helt ny garderob?" },
  { id: "renovering", label: "Renoveringsbudget", amount: 100_000, copy: "Kök, soffa eller all teknik på en gång." },
  { id: "jackpot", label: "Vardagsjackpot", amount: 1_000_000, copy: "Fortfarande vanligt. Bara ovanligt mycket av det." },
];

export function GameStarter({ mode }: { mode: GameMode }) {
  const router = useRouter();
  const { currency, startGame } = useGame();
  const { t, locale } = useLanguage();
  const [tab, setTab] = useState<"profiles" | "stock" | "custom">(mode === "luxury" ? "profiles" : "custom");
  const [loading, setLoading] = useState(false);
  const [stockName, setStockName] = useState("Min aktie");
  const [shares, setShares] = useState("1000");
  const [targetPrice, setTargetPrice] = useState("100");
  const [quoteCurrency, setQuoteCurrency] = useState<CurrencyCode>("USD");
  const [customAmount, setCustomAmount] = useState(mode === "luxury" ? "1000000000" : "10000");
  const [error, setError] = useState("");

  const stockPreview = useMemo(() => {
    const quantity = Number(shares);
    const price = Number(targetPrice);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0) return 0;
    return currencyToSek(quantity * price, quoteCurrency);
  }, [shares, targetPrice, quoteCurrency]);

  async function launch(setup: GameSetup | null) {
    if (!setup) { setError(t("starter.invalid")); return; }
    setError("");
    setLoading(true);
    try { await startGame(setup); router.push("/shop"); }
    finally { setLoading(false); }
  }

  return (
    <section className="bg-[var(--paper)] py-10 text-[var(--ink)] md:py-14">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow text-[var(--gold-dark)]">{mode === "luxury" ? t("landing.luxury") : t("landing.everyday")}</p>
            <h1 className="mt-3 font-display text-5xl leading-[.95] md:text-6xl">{mode === "luxury" ? t("starter.luxuryTitle") : t("starter.everydayTitle")}</h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-black/55">{mode === "luxury" ? t("starter.luxuryCopy") : t("starter.everydayCopy")}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {mode === "luxury" && <button type="button" onClick={() => setTab("profiles")} className={`tab-button ${tab === "profiles" ? "is-active" : ""}`}><Crown className="h-4 w-4" /> {t("starter.profiles")}</button>}
              <button type="button" onClick={() => setTab("custom")} className={`tab-button ${tab === "custom" ? "is-active" : ""}`}><WalletCards className="h-4 w-4" /> {mode === "luxury" ? t("starter.customLuxury") : t("starter.customEveryday")}</button>
              <button type="button" onClick={() => setTab("stock")} className={`tab-button ${tab === "stock" ? "is-active" : ""}`}><BarChart3 className="h-4 w-4" /> {t("starter.stock")}</button>
            </div>
            <p className="mt-5 text-xs leading-5 text-black/40">{t("starter.disclaimer")}</p>
          </div>

          <div>
            {tab === "profiles" && mode === "luxury" && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <button type="button" onClick={() => void launch(createClassicSetup(currency))} className="profile-card bg-[var(--ink)] text-white"><div className="avatar">1B</div><p className="mt-4 text-xs uppercase tracking-[.14em] text-[var(--gold)]">{t("starter.classic")}</p><h2 className="mt-1 font-display text-2xl">{t("starter.oneBillion")}</h2><p className="mt-2 text-sm text-white/50">{formatMoneyFromSek(1_000_000_000, currency, locale)}</p></button>
              {wealthProfiles.map((profile) => {
                const budgetSek = currencyToSek(profile.netWorthUsd, "USD");
                return <button key={profile.id} type="button" onClick={() => void launch(createPersonSetup(profile.id, currency))} className="profile-card"><div className="avatar bg-black/5 text-black">{profile.initials}</div><p className="mt-4 text-xs uppercase tracking-[.12em] text-black/40">{profile.profession}</p><h2 className="mt-1 font-display text-2xl">{profile.name}</h2><p className="mt-2 text-sm font-semibold text-[var(--gold-dark)]">{formatCompactMoneyFromSek(budgetSek, currency, locale)}</p></button>;
              })}
            </div>}

            {tab === "custom" && <div className="rounded-xl border border-black/10 bg-white p-5 md:p-7">
              {mode === "everyday" && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{everydayPresets.map((preset) => {
                const setup = createPresetSetup(mode, preset.id, preset.label, preset.amount, currency);
                return <button key={preset.id} type="button" onClick={() => void launch(setup)} className="budget-card"><p className="text-xs font-bold uppercase tracking-[.13em] text-[var(--gold-dark)]">{preset.label}</p><p className="mt-2 font-display text-3xl">{formatMoneyFromSek(setup.startingBudgetSek, currency, locale)}</p><p className="mt-2 text-sm leading-5 text-black/50">{preset.copy}</p></button>;
              })}</div>}
              <div className={mode === "everyday" ? "mt-6 border-t border-black/10 pt-6" : ""}><p className="text-xs font-bold uppercase tracking-[.13em] text-[var(--gold-dark)]">{t("starter.customAmount", { currency })}</p><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input inputMode="decimal" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} className="field flex-1" aria-label="Eget budgetbelopp" /><button type="button" disabled={loading} onClick={() => void launch(createCustomSetup(mode, Number(customAmount), currency))} className="primary-button"><Coins className="h-4 w-4" /> {t("starter.startAmount")}</button></div></div>
            </div>}

            {tab === "stock" && <div className="rounded-xl border border-black/10 bg-white p-5 md:p-7"><div className="grid gap-4 sm:grid-cols-2"><label className="field-label">{t("starter.stockName")}<input value={stockName} onChange={(event) => setStockName(event.target.value)} className="field mt-1.5" /></label><label className="field-label">{t("starter.shares")}<input inputMode="numeric" value={shares} onChange={(event) => setShares(event.target.value)} className="field mt-1.5" /></label><label className="field-label">{t("starter.targetPrice")}<input inputMode="decimal" value={targetPrice} onChange={(event) => setTargetPrice(event.target.value)} className="field mt-1.5" /></label><label className="field-label">{t("starter.quoteCurrency")}<select value={quoteCurrency} onChange={(event) => setQuoteCurrency(event.target.value as CurrencyCode)} className="field mt-1.5">{currencies.map((entry) => <option key={entry.code} value={entry.code}>{entry.code} – {entry.name}</option>)}</select></label></div><div className="mt-5 flex flex-col justify-between gap-4 rounded-lg bg-[var(--paper)] p-4 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-black/40">{t("starter.shoppingBudget")}</p><p className="mt-1 font-display text-3xl">{stockPreview > 0 ? formatMoneyFromSek(stockPreview, currency, locale) : "–"}</p></div><button type="button" disabled={loading} onClick={() => void launch(createStockSetup({ mode, stockName, shares: Number(shares), targetPrice: Number(targetPrice), quoteCurrency, currency }))} className="primary-button">{t("starter.startStock")} <ArrowRight className="h-4 w-4" /></button></div></div>}
            {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
            {loading && <div className="mt-4 flex items-center gap-2 text-sm text-black/50"><LoaderCircle className="h-4 w-4 animate-spin" /> {t("starter.loading")}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
