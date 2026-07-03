"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section className="bg-[var(--paper)] py-24 text-center text-[var(--ink)]">
      <div className="shell max-w-xl">
        <h1 className="font-display text-6xl">Något tappade miljardärskänslan</h1>
        <p className="mt-4 text-black/55">Ett oväntat fel uppstod. Din lokala varukorg finns normalt kvar.</p>
        <button type="button" onClick={reset} className="mt-7 rounded-full bg-[var(--ink)] px-6 py-3 font-semibold text-white focus-ring">Försök igen</button>
      </div>
    </section>
  );
}
