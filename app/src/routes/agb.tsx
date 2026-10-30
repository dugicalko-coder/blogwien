import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "../lib/seo";
import { PRICE_EUR } from "../lib/site";

export const Route = createFileRoute("/agb")({
  head: () => pageHead({ title: "AGB | BlogWien", description: "Allgemeine Geschäftsbedingungen für Beiträge und Premium-Postings auf BlogWien.", path: "/agb" }),
  component: Page,
});

const SECTIONS: [string, string][] = [
  ["1. Geltungsbereich", "Diese Bedingungen gelten für die Nutzung von BlogWien.at, insbesondere für das Einreichen von Beiträgen und den Kauf von Premium-Postings. Anbieter ist der im Impressum genannte Medieninhaber."],
  ["2. Leistungen", `Das Einreichen von Beiträgen ist kostenlos. Das Premium-Posting kostet einmalig ${PRICE_EUR} Euro inklusive Umsatzsteuer und umfasst die Prüfung innerhalb von 24 Stunden an Werktagen, bis zu zwei dofollow-Links auf die Website des Autors, die Platzierung auf der Startseite sowie die Aufnahme in Sitemap und Kategorie-Seiten. Ein bestimmtes Ergebnis in Suchmaschinen wird nicht zugesagt.`],
  ["3. Redaktionelle Prüfung", "Alle Beiträge werden vor der Veröffentlichung von der Redaktion gelesen. Rechtschreibung, Formatierung und Bildauswahl dürfen angepasst werden. Beiträge, die nicht zu den Richtlinien passen, werden nicht veröffentlicht. In diesem Fall wird ein bezahlter Betrag zurückerstattet, wenn keine Überarbeitung gewünscht ist."],
  ["4. Richtlinien für Beiträge", "Beiträge sind eigene Texte mit Bezug zu Wien oder Österreich und bieten Lesern einen echten Mehrwert. Der Ton ist sachlich und respektvoll. Links passen zum Thema, maximal zwei Links führen auf die eigene Domain. Themen, die eine gesonderte Prüfung brauchen, werden vorab mit der Redaktion abgestimmt."],
  ["5. Rechte am Beitrag", "Mit dem Einreichen erhält BlogWien das einfache, zeitlich unbegrenzte Recht, den Beitrag auf BlogWien.at und in den eigenen Kanälen zu zeigen. Der Autor bestätigt, dass er über die Rechte an Text und Bildern verfügt, und bleibt für den Inhalt verantwortlich."],
  ["6. Zahlung und Rechnung", "Die Zahlung erfolgt online vor der Freigabe. Die Rechnung kommt per E-Mail. Da die Prüfung des Beitrags sofort nach der Zahlung beginnt, erklärt sich der Kunde mit dem vorzeitigen Beginn der Leistung einverstanden."],
  ["7. Änderung und Entfernung", "Autoren können jederzeit die Änderung oder Entfernung ihres Beitrags anfragen. BlogWien kann Beiträge zurückziehen, die nachträglich nicht mehr zu den Richtlinien passen."],
  ["8. Gewährleistung", "BlogWien bemüht sich um einen stabilen Betrieb, übernimmt aber keine Zusage für die dauerhafte Verfügbarkeit der Plattform, die Aufnahme in Suchmaschinen oder wirtschaftliche Ergebnisse."],
  ["9. Anwendbares Recht", "Es gilt österreichisches Recht. Gerichtsstand für Unternehmer ist Wien."],
];

function Page() {
  return (
    <div className="container-bw py-12">
      <div className="prose-bw mx-auto max-w-3xl">
        <p className="eyebrow">Rechtliches</p>
        <h1 className="mt-2 text-4xl">Allgemeine Geschäftsbedingungen</h1>
        {SECTIONS.map(([h, t]) => (
          <section key={h}>
            <h2>{h}</h2>
            <p>{t}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
