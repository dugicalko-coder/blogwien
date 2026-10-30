import { ImageUpload } from "../components/site/ImageUpload";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ChangeEvent } from "react";
import { StructuredData } from "../components/StructuredData";
import { Content, wordCount } from "../components/site/Content";
import { PenIcon } from "../components/site/Shell";
import { jsonLd, orgGraph, pageHead } from "../lib/seo";
import { CATEGORIES, PRICE_EUR } from "../lib/site";

export const Route = createFileRoute("/schreiben")({
  head: () =>
    pageHead({
      title: "Beitrag schreiben und veröffentlichen | BlogWien",
      description:
        "Schreiben Sie Ihren Blogbeitrag für Wien direkt im Editor. Kostenlos einreichen oder für 99 Euro als Premium-Posting mit Backlink und schneller Freigabe veröffentlichen.",
      path: "/schreiben",
    }),
  component: WritePage,
});

const SCHEMA = jsonLd([...orgGraph()]);

type Form = {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author_name: string;
  author_email: string;
  company: string;
  website_url: string;
  cover_image: string;
  agb: boolean;
};

const EMPTY: Form = {
  title: "",
  category: CATEGORIES[0].slug,
  excerpt: "",
  content: "",
  author_name: "",
  author_email: "",
  company: "",
  website_url: "",
  cover_image: "",
  agb: false,
};

function WritePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(EMPTY);
  const [step, setStep] = useState<"edit" | "choose">("edit");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const words = useMemo(() => wordCount(form.content), [form.content]);
  const set = (k: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const problems: string[] = [];
  if (form.title.trim().length < 10) problems.push("Titel: mindestens 10 Zeichen");
  if (form.excerpt.trim().length < 30) problems.push("Kurzbeschreibung: mindestens 30 Zeichen");
  if (words < 100) problems.push(`Text: mindestens 100 Wörter (aktuell ${words})`);
  if (form.author_name.trim().length < 2) problems.push("Name des Autors fehlt");
  if (!/^\S+@\S+\.\S+$/.test(form.author_email)) problems.push("Gültige E-Mail-Adresse angeben");
  if (!form.agb) problems.push("AGB und Datenschutz bestätigen");
  const canContinue = problems.length === 0;

  async function submit(premium: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, premium, hp: "" }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; premium?: boolean; orderId?: string; slug?: string };
      if (!data.ok) {
        setError(data.error ?? "Fehler beim Speichern");
        setBusy(false);
        return;
      }
      if (data.premium && data.orderId) {
        void navigate({ to: "/bezahlen/$orderId", params: { orderId: data.orderId } });
      } else {
        void navigate({ to: "/eingereicht", search: { slug: data.slug ?? "" } });
      }
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte erneut versuchen.");
      setBusy(false);
    }
  }

  return (
    <div className="container-bw py-12">
      <StructuredData json={SCHEMA} />
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow">Blog Wien · Beitrag schreiben</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Schreiben Sie Ihren Beitrag für Wien</h1>
        <p className="mt-4 max-w-2xl text-ink-2">
          Kein Konto, kein Aufwand. Titel, Kategorie, Text, Ihre Angaben, fertig. Vor dem Veröffentlichen entscheiden Sie, ob Sie
          kostenlos einreichen oder für {PRICE_EUR} Euro mehr Reichweite und einen Backlink wollen.
        </p>

        {step === "edit" && (
          <form
            className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]"
            onSubmit={(e) => {
              e.preventDefault();
              if (canContinue) setStep("choose");
            }}
          >
            <div className="space-y-6">
              <div>
                <label className="label" htmlFor="title">Titel des Beitrags</label>
                <input id="title" className="field text-lg font-semibold" value={form.title} onChange={set("title")} placeholder="z. B. Dachsanierung in Wien: Kosten, Ablauf, Förderung" maxLength={140} required />
                <p className="mt-1 text-xs text-ink-3">Tipp: Hauptkeyword und Ort in den Titel, so wird der Beitrag bei Google gefunden.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="label" htmlFor="category">Kategorie</label>
                  <select id="category" className="field" value={form.category} onChange={set("category")}>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <ImageUpload value={form.cover_image} onChange={(url) => setForm((f) => ({ ...f, cover_image: url }))} label="Titelbild (optional)" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="excerpt">Kurzbeschreibung (erscheint in der Übersicht und bei Google)</label>
                <textarea id="excerpt" className="field" rows={2} value={form.excerpt} onChange={set("excerpt")} maxLength={300} required />
                <p className="mt-1 text-xs text-ink-3">{form.excerpt.length}/300 Zeichen</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="label" htmlFor="content">Ihr Text</label>
                  <button type="button" className="text-sm font-semibold text-wald hover:text-rot" onClick={() => setPreview((v) => !v)}>
                    {preview ? "Editor anzeigen" : "Vorschau anzeigen"}
                  </button>
                </div>
                {preview ? (
                  <div className="card min-h-[24rem] p-6">
                    <Content text={form.content || "Noch kein Text."} />
                  </div>
                ) : (
                  <textarea
                    id="content"
                    className="field min-h-[24rem] font-mono text-sm leading-relaxed"
                    value={form.content}
                    onChange={set("content")}
                    placeholder={"Schreiben Sie hier. Absätze durch Leerzeile trennen.\n\n## Zwischenüberschrift\n\n- Listenpunkt\n- Listenpunkt\n\n**fett** und [Linktext](https://ihre-website.at)"}
                    required
                  />
                )}
                <p className="mt-1 text-xs text-ink-3">
                  {words} Wörter · Formatierung: Leerzeile = Absatz, ## = Überschrift, - = Liste, **fett**, [Text](URL) = Link. Empfohlen: 600 bis 900 Wörter.
                </p>
              </div>
              <fieldset className="grid gap-6 rounded-2xl border border-line bg-white p-6 md:grid-cols-2">
                <legend className="px-2 text-sm font-semibold">Über Sie</legend>
                <div>
                  <label className="label" htmlFor="author">Name</label>
                  <input id="author" className="field" value={form.author_name} onChange={set("author_name")} required />
                </div>
                <div>
                  <label className="label" htmlFor="email">E-Mail (für Rückfragen und Rechnung)</label>
                  <input id="email" type="email" className="field" value={form.author_email} onChange={set("author_email")} required />
                </div>
                <div>
                  <label className="label" htmlFor="company">Unternehmen / Verein (optional)</label>
                  <input id="company" className="field" value={form.company} onChange={set("company")} />
                </div>
                <div>
                  <label className="label" htmlFor="website">Ihre Website (für den Backlink)</label>
                  <input id="website" className="field" value={form.website_url} onChange={set("website_url")} placeholder="www.ihre-firma.at" />
                </div>
              </fieldset>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4" checked={form.agb} onChange={set("agb")} />
                <span>
                  Ich habe die <a href="/agb" className="underline underline-offset-4">AGB</a> und die <a href="/datenschutz" className="underline underline-offset-4">Datenschutzerklärung</a> gelesen. Der Text stammt von mir und verletzt keine Rechte Dritter.
                </span>
              </label>
            </div>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card p-6">
                <p className="eyebrow">Checkliste</p>
                {problems.length === 0 ? (
                  <p className="mt-3 text-sm text-wald">Alles bereit. Weiter zur Veröffentlichung.</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm text-ink-2">
                    {problems.map((p) => (
                      <li key={p} className="flex gap-2"><span aria-hidden className="text-rot">•</span>{p}</li>
                    ))}
                  </ul>
                )}
                <button
                  type="submit"
                  disabled={!canContinue}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-white transition-colors hover:bg-rot disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <PenIcon /> Weiter zum Veröffentlichen
                </button>
              </div>
              <div className="mt-4 rounded-2xl bg-paper-2 p-5 text-sm text-ink-2">
                <p className="font-semibold text-ink">Was gut rankt</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Frage der Leser im ersten Absatz beantworten</li>
                  <li>Bezirke, Orte und konkrete Richtwerte nennen</li>
                  <li>3 bis 5 Zwischenüberschriften</li>
                  <li>Am Ende ein Absatz über Sie mit Link</li>
                </ul>
              </div>
            </aside>
          </form>
        )}

        {step === "choose" && (
          <section className="mt-10" aria-labelledby="reichweite">
            <button type="button" className="text-sm font-semibold text-wald hover:text-rot" onClick={() => setStep("edit")}>
              ← Zurück zum Editor
            </button>
            <h2 id="reichweite" className="mt-3 text-3xl">Wie viel Reichweite soll Ihr Beitrag bekommen?</h2>
            <p className="mt-2 text-ink-2">Ihr Beitrag "{form.title}" ist bereit. Wählen Sie, wie er veröffentlicht wird.</p>
            {error && <p className="mt-4 rounded-xl bg-rot-soft px-4 py-3 text-sm text-rot-dark">{error}</p>}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="card flex flex-col p-7">
                <p className="eyebrow text-ink-3">Kostenlos</p>
                <p className="mt-2 font-display text-5xl font-semibold">0 €</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-ink-2">
                  <li>Beitrag wird nach Prüfung veröffentlicht (ca. eine Woche)</li>
                  <li>Links auf Ihre Website als nofollow</li>
                  <li>Keine Platzierung auf der Startseite</li>
                  <li>Dauerhaft online in der Kategorie</li>
                </ul>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => submit(false)}
                  className="mt-6 rounded-full border-2 border-ink px-5 py-3 font-semibold text-ink transition-colors hover:bg-ink hover:text-white disabled:opacity-50"
                >
                  Kostenlos einreichen
                </button>
              </div>
              <div className="relative flex flex-col rounded-[1.25rem] border-2 border-rot bg-white p-7 shadow-[0_20px_50px_-20px_rgba(196,30,58,0.45)]">
                <span className="absolute -top-3 right-6 rounded-full bg-rot px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">Empfohlen</span>
                <p className="eyebrow">Premium-Posting</p>
                <p className="mt-2 font-display text-5xl font-semibold text-rot">{PRICE_EUR} €</p>
                <p className="text-sm text-ink-3">einmalig, inkl. USt.</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-ink">
                  <li>Dofollow-Backlink auf Ihre Website: stärkt Ihr Google-Ranking</li>
                  <li>Platz auf der Startseite unter Neueste Beiträge</li>
                  <li>Freigabe innerhalb von 24 Stunden an Werktagen</li>
                  <li>Firmenname im Beitrag, Aufnahme in Sitemap und Kategorie</li>
                  <li>Mehr Leser, mehr Anfragen aus Wien</li>
                </ul>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => submit(true)}
                  className="mt-6 rounded-full bg-rot px-5 py-3 font-semibold text-white shadow-[0_6px_0_0_#9a1730] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                >
                  {busy ? "Wird gespeichert…" : `Für ${PRICE_EUR} Euro veröffentlichen`}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
