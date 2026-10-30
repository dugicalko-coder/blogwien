import { createFileRoute } from "@tanstack/react-router";
import { StructuredData } from "../components/StructuredData";
import { getImpressumData } from "../lib/api/blog.functions";
import { jsonLd, orgGraph, pageHead } from "../lib/seo";
import { SITE_URL } from "../lib/site";

export const Route = createFileRoute("/impressum")({
  loader: () => getImpressumData(),
  head: () => pageHead({ title: "Impressum und Kontakt | BlogWien", description: "Impressum, Kontakt und Standort von BlogWien, betrieben von Digital Denker in Wien.", path: "/impressum" }),
  component: ImpressumPage,
});

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm font-semibold text-ink-3">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ImpressumPage() {
  const imp = Route.useLoaderData();
  const name = [imp.company, imp.legalForm].filter(Boolean).join(" ");
  const address = [imp.street, [imp.zip, imp.city].filter(Boolean).join(" "), imp.country].filter(Boolean).join(", ");
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(imp.mapQuery || address || "Wien")}&output=embed`;
  const schema = jsonLd([
    ...orgGraph(),
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/impressum#business`,
      name: name || "Digital Denker",
      url: SITE_URL,
      email: imp.email || undefined,
      telephone: imp.phone || undefined,
      address: { "@type": "PostalAddress", streetAddress: imp.street || undefined, postalCode: imp.zip || undefined, addressLocality: imp.city || "Wien", addressCountry: "AT" },
      parentOrganization: { "@id": `${SITE_URL}/#org` },
    },
  ]);
  return (
    <div className="container-bw py-12">
      <StructuredData json={schema} />
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Rechtliches</p>
        <h1 className="mt-2 text-4xl">Impressum</h1>
        <p className="mt-3 text-ink-2">Offenlegung gemäß § 5 ECG, § 14 UGB und § 25 MedienG.</p>
        <dl className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white px-6">
          <Row label="Medieninhaber" value={name || "Digital Denker"} />
          <Row label="Inhaber / Geschäftsführung" value={imp.owner} />
          <Row label="Anschrift" value={address} />
          <Row label="Telefon" value={imp.phone} />
          <Row label="E-Mail" value={imp.email} />
          <Row label="UID-Nummer" value={imp.uid} />
          <Row label="Firmenbuchnummer" value={imp.fn} />
          <Row label="Firmenbuchgericht" value={imp.court} />
          <Row label="Aufsichtsbehörde" value={imp.authority} />
          <Row label="Unternehmensgegenstand" value="Betrieb der Online-Plattform BlogWien.at, Online-Marketing und Werbung" />
          <Row label="Mitgliedschaft" value="Wirtschaftskammer Wien" />
        </dl>
        <h2 className="mt-10 text-2xl">Blattlinie</h2>
        <p className="mt-2 text-ink-2">
          BlogWien ist eine offene Plattform für Beiträge über Wien und Österreich. Gastbeiträge geben die Meinung der jeweiligen
          Autorinnen und Autoren wieder. Die Redaktion prüft Beiträge auf Einhaltung der Richtlinien, übernimmt aber keine Gewähr für
          inhaltliche Richtigkeit.
        </p>
        <h2 className="mt-10 text-2xl">Einsatz von Künstlicher Intelligenz</h2>
        <p className="mt-2 text-ink-2">
          Ein Teil der Redaktionsbeiträge auf BlogWien wird automatisiert mit Hilfe künstlicher Intelligenz erstellt, einschließlich
          der Titelbilder. Solche Beiträge sind am Beitrag selbst mit dem Hinweis „KI-generiert“ gekennzeichnet. Medieninhaber und
          für den Inhalt verantwortlich ist Digital Denker e.U. Hinweise auf Fehler nehmen wir unter der unten angeführten
          E-Mail-Adresse entgegen und korrigieren betroffene Beiträge umgehend.
        </p>
        <h2 className="mt-10 text-2xl">Haftung für Links</h2>
        <p className="mt-2 text-ink-2">
          Beiträge enthalten Links auf externe Websites, auf deren Inhalte wir keinen Einfluss haben. Für diese Inhalte ist
          ausschließlich der jeweilige Betreiber verantwortlich. Rechtswidrige Links entfernen wir nach Kenntnis umgehend.
        </p>
        <h2 className="mt-10 text-2xl">Kontakt</h2>
        <p className="mt-2 text-ink-2">
          Fragen zu Beiträgen, Rechnungen oder Kooperationen: {imp.email ? <a href={`mailto:${imp.email}`} className="font-semibold text-wald underline underline-offset-4">{imp.email}</a> : "per E-Mail"}
          {imp.phone ? <> oder telefonisch unter <a href={`tel:${imp.phone.replace(/\s/g, "")}`} className="font-semibold text-wald underline underline-offset-4">{imp.phone}</a></> : null}.
        </p>
        <h2 className="mt-10 text-2xl">Standort</h2>
        <iframe title="Google Maps: Standort des Büros in Wien" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="mt-4 h-80 w-full rounded-2xl border border-line" />
        <p className="mt-6 text-xs text-ink-3">Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      </div>
    </div>
  );
}
