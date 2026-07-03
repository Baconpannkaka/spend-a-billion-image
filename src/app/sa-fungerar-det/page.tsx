import { Crown, Search, Share2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Så fungerar det", description: "Välj ett läge, bygg en fantasivarukorg och dela resultatet." };

export default function HowItWorksPage() {
  const steps = [[Crown, "1. Välj läge och budget", "Miljardärsläge för extrema drömköp eller Vardagsläge för saker du möter varje dag."], [Search, "2. Sök bland 20 000 produkter", "Filtrera på kategori och underkategori, välj antal direkt på kortet och håll budgeten under kontroll."], [Share2, "3. Genomför och dela", "Få statistik och achievements. Resultatlänken öppnas skrivskyddat och en utmaning startar ett nytt spel med samma budget."]] as const;
  return <section className="bg-[var(--paper)] py-12 text-[var(--ink)]"><div className="shell"><p className="eyebrow text-[var(--gold-dark)]">Tre steg</p><h1 className="mt-3 max-w-5xl font-display text-5xl leading-[.95] md:text-6xl">Välj drömmen. Fyll vagnen. Jämför prioriteringarna.</h1><div className="mt-8 grid gap-4 lg:grid-cols-3">{steps.map(([Icon, title, copy]) => <article key={title} className="rounded-xl border border-black/10 bg-white p-5"><Icon className="h-5 w-5 text-[var(--gold-dark)]" /><h2 className="mt-5 font-display text-3xl">{title}</h2><p className="mt-2 text-sm leading-6 text-black/55">{copy}</p></article>)}</div><div className="mt-6 rounded-xl bg-[var(--ink)] p-6 text-white"><h2 className="font-display text-3xl">Allt är på låtsas</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Sidan säljer ingenting. Priser, förmögenheter och växelkurser är ungefärliga underhållningsvärden. Katalogerna laddas i webbläsaren och speldata sparas lokalt.</p><Link href="/" className="mt-5 inline-flex rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-bold text-black">Välj shoppingläge</Link></div></div></section>;
}
