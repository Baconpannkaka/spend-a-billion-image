import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-[var(--paper)] py-24 text-center text-[var(--ink)]">
      <div className="shell max-w-xl">
        <p className="font-display text-8xl text-[var(--gold-dark)]">404</p>
        <h1 className="mt-3 font-display text-6xl">Den här lyxen finns inte</h1>
        <p className="mt-4 text-black/55">Sidan kan ha flyttats, eller så var den helt enkelt för exklusiv för internet.</p>
        <Link href="/shop" className="mt-7 inline-flex rounded-full bg-[var(--ink)] px-6 py-3 font-semibold text-white focus-ring">Till shoppen</Link>
      </div>
    </section>
  );
}
