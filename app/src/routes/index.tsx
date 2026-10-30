import { Link, createFileRoute } from "@tanstack/react-router";
import type { Post } from "../lib/seed-types";
import { StructuredData } from "../components/StructuredData";
import { Faq, faqJsonLd } from "../components/site/Faq";
import { PostCard } from "../components/site/PostCard";
import { ArrowLink, PenIcon, WriteCta } from "../components/site/Shell";
import { getHomeData } from "../lib/api/blog.functions";
import { jsonLd, orgGraph, pageHead } from "../lib/seo";
import { CATEGORIES, HOME_FAQ, PRICE_EUR, SITE_NAME, SITE_URL } from "../lib/site";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () =>
    pageHead({
      title: "Blog Wien: Beiträge schreiben, veröffentlichen, gefunden werden | BlogWien",
      description:
        "BlogWien ist der offene Blog für Wien und Österreich. Kostenlos schreiben, ab 99 Euro mit Backlink veröffentlichen und bei Google sichtbar werden. Über 20 Beiträge zu Wien, Bauen, Energie, Kulinarik und mehr.",
      path: "/",
    }),
  component: HomePage,
});

const HOME_SCHEMA = jsonLd([
  ...orgGraph(),
  {
    "@type": "Service",
    "@id": `${SITE_URL}/#service`,
    name: "Blogposting Wien",
    serviceType: "Blogbeitrag veröffentlichen mit Backlink",
    provider: { "@id": `${SITE_URL}/#org` },
    areaServed: "Wien, Österreich",
    offers: { "@type": "Offer", price: String(PRICE_EUR), priceCurrency: "EUR", url: `${SITE_URL}/schreiben` },
  },
  faqJsonLd(HOME_FAQ),
]);

function HomePage() {
  const { latest, news, total, mapQuery } = Route.useLoaderData();
  const featured = latest[0];
  const rest = latest.slice(1);
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  return (
    <>
      <StructuredData json={HOME_SCHEMA} />

      {/* Hero */}
      <section className="border-b border-line bg-paper-2">
        <div className="container-bw grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="eyebrow">Blog Wien · Blogposting Wien</p>
            <h1 className="mt-4 text-4xl leading-[1.08] md:text-6xl">
              Der Blog, in dem <span className="text-rot">ganz Wien</span> schreibt.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-2">
              BlogWien ist die offene Blog-Plattform für Wien und Österreich. Schreiben Sie Ihren Beitrag kostenlos, veröffentlichen
              Sie ihn ab {PRICE_EUR} Euro mit Backlink und werden Sie bei Google gefunden. Für Unternehmen, Vereine und alle, die
              etwas zu sagen haben.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <WriteCta large />
              <ArrowLink to="/blog">Alle {total} Beiträge lesen</ArrowLink>
            </div>
            <ul className="mt-10 grid grid-cols-3 gap-4 text-sm">
              <li>
                <span className="block font-display text-3xl font-semibold text-ink">{total}+</span>
                <span className="text-ink-3">Beiträge online</span>
              </li>
              <li>
                <span className="block font-display text-3xl font-semibold text-ink">{PRICE_EUR} €</span>
                <span className="text-ink-3">pro Premium-Posting</span>
              </li>
              <li>
                <span className="block font-display text-3xl font-semibold text-ink">24 h</span>
                <span className="text-ink-3">Freigabe an Werktagen</span>
              </li>
            </ul>
          </div>
          <div className="relative">
            <img
              src="/assets/wien-stephansdom.jpg"
              alt="Illustration von Wien mit Stephansdom, Riesenrad und einem Schreibtisch mit Notizbuch"
              width={1280}
              height={720}
              className="w-full rounded-[1.5rem] border border-line shadow-[0_30px_60px_-30px_rgba(28,27,31,0.4)]"
              fetchPriority="high"
            />
            <div className="absolute -bottom-5 left-6 rounded-2xl border border-line bg-white px-4 py-3 text-sm shadow-lg">
              <span className="font-semibold">Jeder darf schreiben.</span> <span className="text-ink-2">Die Redaktion prüft.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Neueste Beitraege */}
      <section className="container-bw py-16" aria-labelledby="neueste">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Frisch veröffentlicht</p>
            <h2 id="neueste" className="mt-2 text-3xl md:text-4xl">Neueste Beiträge aus Wien und Österreich</h2>
          </div>
          <ArrowLink to="/blog">Alle Beiträge</ArrowLink>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featured && <PostCard post={featured} featured />}
          {rest.slice(0, 4).map((p: Post) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

      {/* So funktioniert es */}
      <section className="bg-ink py-16 text-paper" aria-labelledby="ablauf">
        <div className="container-bw">
          <p className="eyebrow text-gold">So funktioniert BlogWien</p>
          <h2 id="ablauf" className="mt-2 text-3xl md:text-4xl">In drei Schritten zum veröffentlichten Beitrag</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Schreiben",
                d: "Sie schreiben Ihren Beitrag direkt im Editor: Titel, Kategorie, Text, optional ein Bild und Ihre Website. Kein Konto nötig.",
              },
              {
                n: "2",
                t: "Reichweite wählen",
                d: `Kostenlos einreichen oder Premium um ${PRICE_EUR} Euro: mit Backlink auf Ihre Website, Platz auf der Startseite und Freigabe innerhalb von 24 Stunden.`,
              },
              {
                n: "3",
                t: "Gefunden werden",
                d: "Die Redaktion prüft und veröffentlicht. Ihr Beitrag steht dauerhaft online, in der Sitemap und wird von Google indexiert.",
              },
            ].map((s) => (
              <li key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="font-display text-5xl font-semibold text-gold">{s.n}</span>
                <h3 className="mt-3 text-2xl">{s.t}</h3>
                <p className="mt-2 text-paper/75">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link to="/schreiben" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-ink hover:bg-white">
              <PenIcon /> Jetzt Beitrag starten
            </Link>
          </div>
        </div>
      </section>

      {/* Kategorien */}
      <section className="container-bw py-16" aria-labelledby="kategorien">
        <p className="eyebrow">Themen</p>
        <h2 id="kategorien" className="mt-2 text-3xl md:text-4xl">Kategorien im Blog Wien</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/kategorie/$slug" params={{ slug: c.slug }} className="card group overflow-hidden hover:border-rot">
              <img src={c.image} alt={`Illustration Kategorie ${c.name}`} loading="lazy" width={640} height={360} className="aspect-[16/9] w-full object-cover" />
              <div className="p-5">
                <h3 className="text-xl group-hover:text-rot">{c.name}</h3>
                <p className="mt-1 text-sm text-ink-2">{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* News */}
      {news.length > 0 && (
        <section className="border-y border-line bg-paper-2 py-14" aria-labelledby="news">
          <div className="container-bw">
            <p className="eyebrow">Wien-News der Redaktion</p>
            <h2 id="news" className="mt-2 text-3xl">Aktuelles aus Wien</h2>
            <ul className="mt-6 divide-y divide-line">
              {news.map((n: Post) => (
                <li key={n.id} className="py-4">
                  <Link to="/blog/$slug" params={{ slug: n.slug }} className="text-lg font-semibold hover:text-rot">
                    {n.title}
                  </Link>
                  <p className="mt-1 text-sm text-ink-2">{n.excerpt}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Preis */}
      <section className="container-bw py-16" aria-labelledby="preis">
        <div className="grid items-center gap-10 rounded-[2rem] border border-line bg-white p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="eyebrow">Premium-Posting</p>
            <h2 id="preis" className="mt-2 text-3xl md:text-4xl">Mehr Reichweite für {PRICE_EUR} Euro, einmalig</h2>
            <p className="mt-4 text-ink-2">
              Kostenlos schreiben kann jeder. Wer will, dass Google und die Wiener Leserschaft den Beitrag auch finden, wählt vor dem
              Veröffentlichen das Premium-Posting.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Dofollow-Backlink auf Ihre Website (bis zu zwei Links)",
                "Platzierung auf der Startseite unter Neueste Beiträge",
                "Freigabe innerhalb von 24 Stunden an Werktagen",
                "Firmenname und Autor im Beitrag, dauerhaft online",
                "Aufnahme in Sitemap und Kategorie-Seiten für Google",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wald text-xs text-white">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-paper-2 p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-3">Einmalig</p>
            <p className="mt-2 font-display text-7xl font-semibold text-rot">{PRICE_EUR} €</p>
            <p className="text-ink-2">pro Beitrag, inkl. USt.</p>
            <Link
              to="/schreiben"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-rot bg-rot px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-white hover:text-rot"
            >
              Jetzt für {PRICE_EUR} Euro veröffentlichen
            </Link>
            <Link to="/schreiben" className="mt-3 inline-block text-sm font-semibold text-ink-2 underline underline-offset-4 hover:text-rot">
              oder kostenlos einreichen
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-bw py-8">
        <Faq items={HOME_FAQ} title={`Häufige Fragen zu ${SITE_NAME}`} />
      </section>

      {/* Standort */}
      <section className="container-bw py-16" aria-labelledby="standort">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="eyebrow">Aus Wien, für Wien</p>
            <h2 id="standort" className="mt-2 text-3xl">Unser Büro in Wien</h2>
            <p className="mt-4 text-ink-2">
              BlogWien wird von Digital Denker betrieben, einem Wiener Team für lokale Online-Sichtbarkeit. Wir kennen die Stadt, die
              Bezirke und die Suchanfragen, die hier zählen.
            </p>
            <p className="mt-4">
              <Link to="/impressum" className="font-semibold text-wald hover:text-rot">
                Kontakt und Impressum
              </Link>
            </p>
          </div>
          <iframe
            title="Google Maps: Standort BlogWien in Wien"
            src={mapSrc}
            width="600"
            height="320"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full rounded-2xl border border-line"
          />
        </div>
      </section>
    </>
  );
}
