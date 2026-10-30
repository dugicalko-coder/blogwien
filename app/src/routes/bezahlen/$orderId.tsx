import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { pageHead } from "../../lib/seo";
import { PRICE_EUR } from "../../lib/site";

export const Route = createFileRoute("/bezahlen/$orderId")({
  head: () => pageHead({ title: "Zahlung: Premium-Posting | BlogWien", description: "Bezahlen Sie Ihr Premium-Posting sicher online.", path: "/bezahlen", noindex: true }),
  component: PayPage,
});

type OrderView = {
  stripe?: boolean;
  order: { id: string; status: string; amount_cents: number; email: string };
  post: { title: string; slug: string; status: string; website_url: string };
};

function PayPage() {
  const { orderId } = Route.useParams();
  const [data, setData] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState("karte");
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvc: "" });

  useEffect(() => {
    fetch(`/api/pay?order=${encodeURIComponent(orderId)}`)
      .then((r) => r.json())
      .then((j: { ok: boolean; error?: string } & Partial<OrderView>) => {
        if (!j.ok || !j.order || !j.post) setError(j.error ?? "Bestellung nicht gefunden");
        else setData({ stripe: Boolean(j.stripe), order: j.order, post: j.post });
      })
      .catch(() => setError("Verbindung fehlgeschlagen"));
  }, [orderId]);

  async function payStripe() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/stripe/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId }) });
      const j = (await r.json()) as { ok: boolean; url?: string; paid?: boolean; error?: string };
      if (j.ok && j.url) {
        window.location.href = j.url;
        return;
      }
      if (j.ok && j.paid) setData((d) => (d ? { ...d, order: { ...d.order, status: "paid" } } : d));
      else setError(j.error ?? "Zahlung konnte nicht gestartet werden");
    } catch {
      setError("Verbindung fehlgeschlagen");
    }
    setBusy(false);
  }

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/pay", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId, method }) });
      const j = (await r.json()) as { ok: boolean; error?: string };
      if (!j.ok) setError(j.error ?? "Zahlung fehlgeschlagen");
      else setData((d) => (d ? { ...d, order: { ...d.order, status: "paid" } } : d));
    } catch {
      setError("Verbindung fehlgeschlagen");
    }
    setBusy(false);
  }

  const paid = data?.order.status === "paid";

  return (
    <div className="container-bw py-14">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_320px]">
        <div className="card p-8">
          {error && <p className="mb-4 rounded-xl bg-rot-soft px-4 py-3 text-sm text-rot-dark">{error}</p>}
          {!data && !error && <p className="text-ink-2">Bestellung wird geladen…</p>}
          {data && !paid && (
            <>
              <p className="eyebrow">Sicher bezahlen</p>
              <h1 className="mt-2 text-3xl">Premium-Posting bezahlen</h1>
              <p className="mt-2 text-ink-2">Nach der Zahlung geht Ihr Beitrag sofort in die Redaktionsfreigabe (innerhalb von 24 Stunden an Werktagen).</p>
              {data.stripe ? (
                <>
                  <p className="mt-6 rounded-xl bg-paper-2 p-4 text-sm text-ink-2">
                    Sie werden zur sicheren Zahlungsseite von Stripe weitergeleitet. Dort können Sie mit Kreditkarte, Apple Pay, Google Pay, EPS oder Klarna bezahlen. Die Rechnung erhalten Sie automatisch per E-Mail.
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={payStripe}
                    className="mt-6 w-full rounded-2xl bg-rot px-6 py-4 text-lg font-semibold text-white shadow-[0_6px_0_0_#9a1730] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                  >
                    {busy ? "Weiterleitung…" : `${PRICE_EUR},00 € sicher bezahlen`}
                  </button>
                </>
              ) : (
                <>
              <div className="mt-6 flex gap-2">
                    {[
                      { id: "karte", label: "Kreditkarte" },
                      { id: "paypal", label: "PayPal" },
                      { id: "eps", label: "EPS / Sofort" },
                    ].map((m) => (
                      <button key={m.id} type="button" onClick={() => setMethod(m.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${method === m.id ? "border-rot bg-rot-soft text-rot-dark" : "border-line hover:border-ink"}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {method === "karte" && (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="label" htmlFor="cname">Name auf der Karte</label>
                        <input id="cname" className="field" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} autoComplete="cc-name" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="label" htmlFor="cnum">Kartennummer</label>
                        <input id="cnum" className="field" inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" autoComplete="cc-number" />
                      </div>
                      <div>
                        <label className="label" htmlFor="cexp">Gültig bis</label>
                        <input id="cexp" className="field" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} placeholder="MM/JJ" autoComplete="cc-exp" />
                      </div>
                      <div>
                        <label className="label" htmlFor="ccvc">Prüfziffer</label>
                        <input id="ccvc" className="field" inputMode="numeric" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" autoComplete="cc-csc" />
                      </div>
                    </div>
                  )}
                  {method !== "karte" && <p className="mt-6 rounded-xl bg-paper-2 p-4 text-sm text-ink-2">Sie werden nach Klick auf Bezahlen zum Anbieter weitergeleitet.</p>}
                  <p className="mt-4 text-xs text-ink-3">Testbetrieb: Die Zahlung wird im Moment simuliert, es wird nichts abgebucht. Stripe wird als nächster Schritt angebunden.</p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={pay}
                    className="mt-6 w-full rounded-2xl bg-rot px-6 py-4 text-lg font-semibold text-white shadow-[0_6px_0_0_#9a1730] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                  >
                    {busy ? "Wird verarbeitet…" : `${PRICE_EUR},00 € jetzt bezahlen`}
                  </button>
                </>
              )}
              <p className="mt-3 text-center text-xs text-ink-3">SSL-verschlüsselt · Rechnung per E-Mail an {data.order.email}</p>
            </>
          )}
          {data && paid && (
            <div className="text-center">
              <span aria-hidden className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-wald-soft text-2xl text-wald">✓</span>
              <h1 className="mt-5 text-3xl">Zahlung erfolgreich, danke!</h1>
              <p className="mt-3 text-ink-2">
                Ihr Premium-Beitrag "{data.post.title}" ist bei der Redaktion. Sobald er freigegeben ist, erreichen Sie ihn unter
                blogwien.at/blog/{data.post.slug}. Sie erhalten eine E-Mail mit Link und Rechnung.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/blog" className="rounded-full bg-ink px-5 py-3 font-semibold text-white hover:bg-rot">Beiträge lesen</Link>
                <Link to="/schreiben" className="rounded-full border-2 border-ink px-5 py-3 font-semibold hover:bg-ink hover:text-white">Nächsten Beitrag schreiben</Link>
              </div>
            </div>
          )}
        </div>
        <aside className="card h-fit p-6">
          <p className="eyebrow">Ihre Bestellung</p>
          {data && (
            <>
              <p className="mt-3 font-semibold">{data.post.title}</p>
              <p className="mt-1 text-sm text-ink-2">Premium-Posting mit Backlink{data.post.website_url ? ` auf ${data.post.website_url.replace(/^https?:\/\//, "")}` : ""}</p>
            </>
          )}
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>Premium-Posting</dt><dd>{PRICE_EUR},00 €</dd></div>
            <div className="flex justify-between text-ink-3"><dt>davon 20 % USt.</dt><dd>{(PRICE_EUR - PRICE_EUR / 1.2).toFixed(2)} €</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Gesamt</dt><dd>{PRICE_EUR},00 €</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
