import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "../lib/seo";

export const Route = createFileRoute("/datenschutz")({
  head: () => pageHead({ title: "Datenschutzerklärung | BlogWien", description: "Datenschutzerklärung von BlogWien: Welche Daten wir beim Schreiben, Bezahlen und Besuchen der Website verarbeiten.", path: "/datenschutz" }),
  component: Page,
});

function Page() {
  return (
    <div className="container-bw py-12">
      <div className="prose-bw mx-auto max-w-3xl">
        <p className="eyebrow">Rechtliches</p>
        <h1 className="mt-2 text-4xl">Datenschutzerklärung</h1>
        <p>Der Schutz Ihrer Daten ist uns wichtig. Diese Erklärung informiert gemäß DSGVO und österreichischem Datenschutzgesetz darüber, welche Daten wir verarbeiten und warum. Verantwortlich ist der im Impressum genannte Medieninhaber.</p>
        <h2>1. Besuch der Website</h2>
        <p>Beim Aufruf der Website verarbeitet unser Hosting-Anbieter (Cloudflare, Rechenzentren in der EU) technisch notwendige Daten wie IP-Adresse, Zeitpunkt, aufgerufene Seite und Browsertyp in Server-Logs. Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Wir setzen keine Tracking-Cookies und keine Analyse-Tools von Drittanbietern ein.</p>
        <h2>2. Schreiben und Einreichen von Beiträgen</h2>
        <p>Wenn Sie einen Beitrag einreichen, speichern wir Titel, Text, Kategorie, Ihren Namen, Ihre E-Mail-Adresse, optional Unternehmen und Website. Name, Unternehmen und Website werden mit dem Beitrag veröffentlicht. Die E-Mail-Adresse wird nicht veröffentlicht und nur für Rückfragen, Freigabe-Information und Rechnung verwendet. Rechtsgrundlage ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).</p>
        <h2>3. Zahlung</h2>
        <p>Zahlungen werden über einen Zahlungsdienstleister abgewickelt. Kartendaten werden ausschließlich beim Zahlungsdienstleister verarbeitet und nie auf unseren Servern gespeichert. Wir speichern Bestellnummer, Betrag, Zeitpunkt und Zahlungsstatus für die Rechnungslegung (gesetzliche Aufbewahrungspflicht sieben Jahre).</p>
        <h2>4. Eingebettete Karten und Schriften</h2>
        <p>Auf der Startseite und im Impressum ist eine Google-Maps-Karte eingebettet, Schriften laden wir von Google Fonts. Dabei wird Ihre IP-Adresse an Google übertragen. Rechtsgrundlage ist unser berechtigtes Interesse an einer ansprechenden Darstellung. Weitere Informationen: policies.google.com/privacy.</p>
        <h2>5. Speicherdauer</h2>
        <p>Veröffentlichte Beiträge bleiben dauerhaft online, bis Sie die Löschung verlangen. Nicht veröffentlichte Entwürfe löschen wir nach zwölf Monaten. Rechnungsdaten bewahren wir sieben Jahre auf.</p>
        <h2>6. Ihre Rechte</h2>
        <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch. Wenden Sie sich dazu an die im Impressum angegebene E-Mail-Adresse. Beschwerden richten Sie an die Österreichische Datenschutzbehörde, Barichgasse 40-42, 1030 Wien.</p>
        <h2>7. Cookies</h2>
        <p>Der öffentliche Teil der Website setzt keine Cookies. Nur im Administrationsbereich wird ein technisch notwendiges Sitzungs-Cookie gesetzt.</p>
      </div>
    </div>
  );
}
