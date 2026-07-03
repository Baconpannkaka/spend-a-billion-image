import type { Metadata } from "next";
import { AdProviderScript } from "@/components/ad-provider-script";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Spend a Billion – Hur rik vill du vara?",
    template: "%s | Spend a Billion",
  },
  description:
    "Välj miljardärsläge eller vardagsläge och shoppa bland 20 000 produkter – helt på låtsas.",
  applicationName: "Spend a Billion",
  openGraph: {
    title: "Spend a Billion – Hur rik vill du vara?",
    description: "Välj spelläge, budget och valuta. Bygg en fantasivarukorg bland 20 000 produkter.",
    type: "website",
    locale: "sv_SE",
    siteName: "Spend a Billion",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Spend a Billion – Hur rik vill du vara?",
    description: "Välj miljardärsläge eller vardagsläge och shoppa bort din fantasibudget.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body>
        <a href="#main-content" className="skip-link">Hoppa till innehållet</a>
        <AdProviderScript />
        <Providers>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
