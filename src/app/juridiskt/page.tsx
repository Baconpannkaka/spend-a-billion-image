import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Juridiskt" };

export default function LegalPage() {
  const items = [
    "Sidan är ett oberoende underhållningsprojekt.",
    "Inga produkter säljs, inga beställningar skapas och inga riktiga betalningar genomförs.",
    "Inga kortuppgifter, depåuppgifter eller andra betalningsuppgifter kan anges eller skickas.",
    "Produktpriser är grova fantasivärden och ska inte ses som offerter eller aktuell marknadsdata.",
    "Förmögenhetsuppskattningar är avrundade, daterade och kan förändras snabbt. De används endast som lekfulla scenarier.",
    "Aktiekalkylatorn bygger enbart på användarens egna antaganden. Den visar inte kurser, avkastningsprognoser, skatt eller finansiell rådgivning.",
    "Växelkurserna är fasta referensvärden och uppdateras inte automatiskt.",
    "Personnamn, produktnamn och varumärken tillhör respektive rättighetsinnehavare.",
    "Projektet är inte sponsrat, godkänt eller administrerat av de personer eller varumärken som omnämns.",
    "Speldata sparas endast lokalt i användarens webbläsare. Inga cookies, annonser, trackers eller analysverktyg används.",
    "Kontakta projektets ägare om något material behöver korrigeras eller tas bort.",
  ];
  return (
    <section className="bg-[var(--paper)] py-16 text-[var(--ink)]">
      <div className="shell max-w-4xl">
        <ShieldCheck className="h-9 w-9 text-[var(--gold-dark)]" />
        <h1 className="mt-5 font-display text-6xl md:text-8xl">Juridisk friskrivning</h1>
        <p className="mt-5 text-lg leading-8 text-black/60">Spend a Billion är ett spel, inte en butik, mäklare, investeringsplattform, resebyrå eller återförsäljare.</p>
        <ul className="mt-10 grid gap-3">
          {items.map((item) => <li key={item} className="rounded-xl border border-black/10 bg-white p-4 leading-7 text-black/65">{item}</li>)}
        </ul>
      </div>
    </section>
  );
}
