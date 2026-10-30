import { createFileRoute } from "@tanstack/react-router";
import { StructuredData } from "../components/StructuredData";
import { Faq, faqJsonLd } from "../components/site/Faq";
import { WriteCta } from "../components/site/Shell";
import { jsonLd, orgGraph, pageHead } from "../lib/seo";
import { HOME_FAQ } from "../lib/site";

const MORE = [
  { q: "Wie schreibe ich einen Beitrag, der bei Google rankt?", a: "Hauptkeyword und Ort in den Titel, die Frage der Leser im ersten Absatz beantworten, drei bis fünf Zwischenüberschriften, konkrete Richtwerte und Bezirke nennen, 600 bis 900 Wörter." },
  { q: "Kann ich Bilder hochladen?", a: "Sie können eine Bild-URL angeben. Ohne eigenes Bild verwenden wir die Illustration der Kategorie." },
  { q: "Darf ich den Beitrag auch auf meiner Website veröffentlichen?", a: "Besser nicht, doppelte Inhalte schwächen beide Seiten. Schreiben Sie für BlogWien einen eigenen Text und verlinken Sie ihn von Ihrer Website." },
  { q: "Wie lösche ich einen Beitrag?", a: "Schreiben Sie uns mit dem Link zum Beitrag über die im Impressum angegebene E-Mail-Adresse." },
  { q: "Wer prüft die Beiträge?", a: "Die Redaktion von BlogWien. Wir korrigieren Rechtschreibung und Formatierung, ändern aber keine Aussagen ohne Rücksprache." },
  { q: "Was ist mit Themen außerhalb Wiens?", a: "Beiträge mit Bezug zu Österreich sind willkommen, besonders Niederösterreich, Burgenland und Reisethemen im ganzen Land." },
];

const ALL = [...HOME_FAQ, ...MORE];

export const Route = createFileRoute("/faq")({
  head: () =>
    pageHead({
      title: "Häufige Fragen zu BlogWien: Schreiben, Preise, Backlinks",
      description: "Antworten auf die häufigsten Fragen zu BlogWien: Was kostet ein Beitrag, wie funktioniert der Backlink, wie lange dauert die Freigabe und welche Inhalte sind erlaubt.",
      path: "/faq",
    }),
  component: FaqPage,
});

const SCHEMA = jsonLd([...orgGraph(), faqJsonLd(ALL)]);

function FaqPage() {
  return (
    <div className="container-bw py-12">
      <StructuredData json={SCHEMA} />
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Hilfe</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Häufige Fragen zu BlogWien</h1>
        <p className="mt-4 text-lg text-ink-2">Alles, was Sie vor dem Schreiben wissen wollen. Fehlt etwas? Schreiben Sie uns, die Adresse steht im Impressum.</p>
        <div className="mt-10">
          <Faq items={ALL} title="Fragen und Antworten" />
        </div>
        <div className="mt-12 rounded-3xl bg-paper-2 p-8 text-center">
          <h2 className="text-2xl">Bereit zum Schreiben?</h2>
          <div className="mt-4"><WriteCta large /></div>
        </div>
      </div>
    </div>
  );
}
