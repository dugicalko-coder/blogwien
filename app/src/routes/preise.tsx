import { Link, createFileRoute } from "@tanstack/react-router";
import { StructuredData } from "../components/StructuredData";
import { Faq, faqJsonLd } from "../components/site/Faq";
import { jsonLd, orgGraph, pageHead } from "../lib/seo";
import { PRICE_EUR, SITE_URL } from "../lib/site";

const FAQ = [
  { q: "Gibt es versteckte Kosten?", a: "Nein. Das Premium-Posting kostet einmalig 99 Euro inklusive Umsatzsteuer. Keine Laufzeit, kein Abo." },
  { q: "Was passiert, wenn mein Beitrag abgelehnt wird?", a: "Bei Premium-Beiträgen erhalten Sie eine Rückmeldung mit Änderungswünschen. Wird der Beitrag endgültig abgelehnt, erstatten wir den Betrag." },
  { q: "Gibt es Mengenrabatt?", a: "Ab fünf Premium-Beiträgen pro Jahr, ab zwölf Beiträgen gibt es zusätzlich einen festen Autorenplatz. Anfrage über das Impressum." },
  { q: "Kann ich später von kostenlos auf Premium wechseln?", a: "Ja. Schreiben Sie uns mit dem Link zum Beitrag, wir senden Ihnen den Zahlungslink und aktivieren den Backlink." },
];

export const Route = createFileRoute("/preise")({
  head: () =>
    pageHead({
      title: "Preise: Blogposting Wien ab 99 Euro | BlogWien",
      description: "Kostenlos einreichen oder Premium-Posting um 99 Euro: Backlink, Startseiten-Platzierung und Freigabe in 24 Stunden. Transparente Preise für Blogposting in Wien.",
      path: "/preise",
    }),
  component: PricingPage,
});

const SCHEMA = jsonLd([
  ...orgGraph(),
  {
    "@type": "Product",
    "@id": `${SITE_URL}/preise#premium`,
    name: "Premium-Posting auf BlogWien",
    description: "Blogbeitrag mit dofollow-Backlink, Startseiten-Platzierung und Freigabe innerhalb von 24 Stunden an Werktagen.",
    brand: { "@id": `${SITE_URL}/#org` },
    offers: { "@type": "Offer", price: String(PRICE_EUR), priceCurrency: "EUR", availability: "https://schema.org/InStock", url: `${SITE_URL}/schreiben` },
  },
  faqJsonLd(FAQ),
]);

function PricingPage() {
  return (
    <div className="container-bw py-12">
      <StructuredData json={SCHEMA} />
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Preise</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Ein Preis, keine Überraschungen</h1>
        <p className="mt-4 text-lg text-ink-2">Schreiben ist kostenlos. Reichweite kostet {PRICE_EUR} Euro. Das ist das ganze Preismodell.</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="card flex flex-col p-8">
          <h2 className="text-2xl">Kostenlos</h2>
          <p className="mt-3 font-display text-5xl font-semibold">0 €</p>
          <ul className="mt-6 flex-1 space-y-3 text-ink-2">
            <li>Beitrag schreiben und einreichen</li>
            <li>Redaktionelle Prüfung innerhalb von etwa einer Woche</li>
            <li>Veröffentlichung in der passenden Kategorie</li>
            <li>Links auf Ihre Website als nofollow</li>
            <li>Dauerhaft online</li>
          </ul>
          <Link to="/schreiben" className="mt-8 rounded-full border-2 border-ink px-5 py-3 text-center font-semibold hover:bg-ink hover:text-white">Kostenlos starten</Link>
        </div>
        <div className="relative flex flex-col rounded-[1.25rem] border-2 border-rot bg-white p-8 shadow-[0_20px_50px_-20px_rgba(196,30,58,0.45)]">
          <span className="absolute -top-3 right-6 rounded-full bg-rot px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">Beliebt</span>
          <h2 className="text-2xl">Premium-Posting</h2>
          <p className="mt-3 font-display text-5xl font-semibold text-rot">{PRICE_EUR} €</p>
          <p className="text-sm text-ink-3">einmalig pro Beitrag, inkl. 20 % USt.</p>
          <ul className="mt-6 flex-1 space-y-3">
            <li>Dofollow-Backlink auf Ihre Website, bis zu zwei Links</li>
            <li>Platzierung auf der Startseite unter Neueste Beiträge</li>
            <li>Freigabe innerhalb von 24 Stunden an Werktagen</li>
            <li>Firmenname und Autorenbox im Beitrag</li>
            <li>Aufnahme in Sitemap und Kategorie-Seiten</li>
            <li>Premium-Kennzeichnung und Vorreihung in der Kategorie</li>
            <li>Rechnung per E-Mail</li>
          </ul>
          <Link to="/schreiben" className="mt-8 rounded-full bg-rot px-5 py-3 text-center font-semibold text-white shadow-[0_6px_0_0_#9a1730] transition-all hover:-translate-y-0.5">
            Premium-Beitrag schreiben
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-4xl rounded-2xl bg-paper-2 p-6 text-sm text-ink-2">
        <p className="font-semibold text-ink">Für Agenturen und Vielschreiber</p>
        <p className="mt-1">Ab fünf Beiträgen pro Jahr gibt es Staffelpreise, ab zwölf Beiträgen einen festen Autorenplatz mit eigenem Profil. Anfragen über das <Link to="/impressum" className="underline underline-offset-4">Impressum</Link>.</p>
      </div>
      <div className="mx-auto mt-14 max-w-3xl">
        <Faq items={FAQ} title="Fragen zu den Preisen" />
      </div>
    </div>
  );
}
