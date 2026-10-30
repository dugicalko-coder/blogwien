import { ImageUpload } from "./ImageUpload";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CATEGORIES, DEFAULT_IMPRESSUM, formatDate, type Impressum } from "../../lib/site";
import type { Order, Post } from "../../lib/seed-types";

type Tab = "freigabe" | "alle" | "neu" | "bestellungen" | "einstellungen";

async function api<T = unknown>(action: string, body: Record<string, unknown> = {}): Promise<{ ok: boolean; error?: string } & T> {
  const r = await fetch(`/api/redaktion/${action}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return (await r.json()) as { ok: boolean; error?: string } & T;
}

const STATUS_LABEL: Record<string, string> = { draft: "Entwurf (unbezahlt)", pending: "Wartet auf Freigabe", published: "Veröffentlicht", rejected: "Abgelehnt" };

export function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("freigabe");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    api<{ authed: boolean }>("me").then((r) => setAuthed(Boolean(r.authed))).catch(() => setAuthed(false));
  }, []);

  if (authed === null) return <div className="container-bw py-20 text-ink-2">Lade…</div>;
  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  return (
    <div className="container-bw py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Redaktion</p>
          <h1 className="mt-1 text-3xl">BlogWien Admin</h1>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-ink-2 underline underline-offset-4 hover:text-rot"
          onClick={async () => {
            await api("logout");
            setAuthed(false);
          }}
        >
          Abmelden
        </button>
      </div>
      <Stats />
      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Admin-Bereiche">
        {(
          [
            ["freigabe", "Freigabe"],
            ["alle", "Alle Beiträge"],
            ["neu", "News schreiben"],
            ["bestellungen", "Bestellungen"],
            ["einstellungen", "Einstellungen"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === t ? "bg-ink text-white" : "border border-line hover:border-ink"}`}>
            {label}
          </button>
        ))}
      </nav>
      {msg && (
        <p className="mt-4 rounded-xl bg-wald-soft px-4 py-3 text-sm text-wald" role="status">
          {msg}
        </p>
      )}
      <div className="mt-6">
        {tab === "freigabe" && <PostList status="pending" onMsg={setMsg} />}
        {tab === "alle" && <PostList status="all" onMsg={setMsg} />}
        {tab === "neu" && <NewPost onMsg={setMsg} />}
        {tab === "bestellungen" && <Orders />}
        {tab === "einstellungen" && <Settings onMsg={setMsg} />}
      </div>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="container-bw py-20">
      <form
        className="card mx-auto max-w-sm p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await api("login", { password: pw });
          if (r.ok) onDone();
          else setErr(r.error ?? "Login fehlgeschlagen");
        }}
      >
        <p className="eyebrow">Redaktion</p>
        <h1 className="mt-1 text-2xl">Admin-Login</h1>
        <label className="label mt-6" htmlFor="pw">Passwort</label>
        <input id="pw" type="password" className="field" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
        {err && <p className="mt-3 text-sm text-rot">{err}</p>}
        <button type="submit" className="mt-5 w-full rounded-full bg-ink px-5 py-3 font-semibold text-white hover:bg-rot">Anmelden</button>
      </form>
    </div>
  );
}

function Stats() {
  const [s, setS] = useState<{ published: number; pending: number; drafts: number; paid: number; revenue_cents: number } | null>(null);
  useEffect(() => {
    api<{ stats: typeof s }>("stats").then((r) => r.ok && setS(r.stats));
  }, []);
  if (!s) return null;
  const items = [
    ["Veröffentlicht", s.published],
    ["Wartend", s.pending],
    ["Unbezahlt", s.drafts],
    ["Bezahlte Postings", s.paid],
    ["Umsatz", `${(s.revenue_cents / 100).toFixed(0)} €`],
  ];
  return (
    <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map(([l, v]) => (
        <li key={String(l)} className="card p-4">
          <span className="block font-display text-3xl font-semibold">{v}</span>
          <span className="text-xs text-ink-3">{l}</span>
        </li>
      ))}
    </ul>
  );
}

function PostList({ status, onMsg }: { status: "pending" | "all"; onMsg: (m: string) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const load = useCallback(() => {
    api<{ posts: Post[] }>("posts", { status }).then((r) => r.ok && setPosts(r.posts));
  }, [status]);
  useEffect(load, [load]);

  async function setStatus(id: number, s: string) {
    const r = await api("status", { id, status: s });
    onMsg(r.ok ? `Status gesetzt: ${STATUS_LABEL[s]}` : r.error ?? "Fehler");
    load();
  }
  async function remove(id: number) {
    const r = await api("remove", { id });
    onMsg(r.ok ? "Beitrag gelöscht" : r.error ?? "Fehler");
    load();
  }

  if (editing) {
    return (
      <PostEditor
        post={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          onMsg("Beitrag gespeichert");
          load();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {posts.length === 0 && <p className="text-ink-2">Keine Beiträge in dieser Liste.</p>}
      {posts.map((p) => (
        <div key={p.id} className="card flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`tag ${p.status === "published" ? "" : "tag-rot"}`}>{STATUS_LABEL[p.status] ?? p.status}</span>
              {p.premium === 1 && <span className="tag bg-gold/20 text-ink">Premium</span>}
              {p.is_news === 1 && <span className="tag">News</span>}
              <span className="text-xs text-ink-3">{CATEGORIES.find((c) => c.slug === p.category)?.name}</span>
            </div>
            <p className="mt-2 truncate font-semibold">{p.title}</p>
            <p className="text-xs text-ink-3">
              {p.author_name}
              {p.company ? ` · ${p.company}` : ""}
              {p.website_url ? ` · ${p.website_url}` : ""} · {formatDate(p.created_at)} · {p.views} Aufrufe
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-ink">Ansehen</a>
            <button type="button" onClick={() => setEditing(p)} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-ink">Bearbeiten</button>
            {p.status !== "published" && (
              <button type="button" onClick={() => setStatus(p.id, "published")} className="rounded-full bg-wald px-3 py-1.5 text-sm font-semibold text-white hover:bg-ink">Freigeben</button>
            )}
            {p.status === "published" && (
              <button type="button" onClick={() => setStatus(p.id, "draft")} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-ink">Offline nehmen</button>
            )}
            {p.status !== "rejected" && (
              <button type="button" onClick={() => setStatus(p.id, "rejected")} className="rounded-full border border-rot px-3 py-1.5 text-sm text-rot hover:bg-rot-soft">Ablehnen</button>
            )}
            <button type="button" onClick={() => remove(p.id)} className="rounded-full px-3 py-1.5 text-sm text-ink-3 hover:text-rot">Entfernen</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
    </div>
  );
}

function PostEditor({ post, onCancel, onSaved }: { post: Post; onCancel: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ ...post });
  const [err, setErr] = useState<string | null>(null);
  const up = (k: keyof Post, v: string | number) => setF((s) => ({ ...s, [k]: v }));
  return (
    <form
      className="card space-y-5 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await api("update", {
          id: f.id,
          title: f.title,
          slug: f.slug,
          excerpt: f.excerpt,
          content: f.content,
          category: f.category,
          author_name: f.author_name,
          company: f.company,
          website_url: f.website_url,
          cover_image: f.cover_image,
          backlink: f.backlink,
          premium: f.premium,
          is_news: f.is_news,
          status: f.status,
        });
        if (r.ok) onSaved();
        else setErr(r.error ?? "Fehler");
      }}
    >
      <h2 className="text-2xl">Beitrag bearbeiten</h2>
      {err && <p className="text-sm text-rot">{err}</p>}
      <Field label="Titel"><input className="field" value={f.title} onChange={(e) => up("title", e.target.value)} /></Field>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Slug (URL)"><input className="field" value={f.slug} onChange={(e) => up("slug", e.target.value)} /></Field>
        <Field label="Kategorie">
          <select className="field" value={f.category} onChange={(e) => up("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className="field" value={f.status} onChange={(e) => up("status", e.target.value)}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Kurzbeschreibung"><textarea className="field" rows={2} value={f.excerpt} onChange={(e) => up("excerpt", e.target.value)} /></Field>
      <Field label="Text"><textarea className="field min-h-[20rem] font-mono text-sm" value={f.content} onChange={(e) => up("content", e.target.value)} /></Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Autor"><input className="field" value={f.author_name} onChange={(e) => up("author_name", e.target.value)} /></Field>
        <Field label="Unternehmen"><input className="field" value={f.company} onChange={(e) => up("company", e.target.value)} /></Field>
        <Field label="Website"><input className="field" value={f.website_url} onChange={(e) => up("website_url", e.target.value)} /></Field>
        <ImageUpload value={f.cover_image} onChange={(url) => up("cover_image", url)} label="Titelbild" />
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.premium === 1} onChange={(e) => up("premium", e.target.checked ? 1 : 0)} /> Premium</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.backlink === 1} onChange={(e) => up("backlink", e.target.checked ? 1 : 0)} /> Dofollow-Backlink</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_news === 1} onChange={(e) => up("is_news", e.target.checked ? 1 : 0)} /> Wien-News</label>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="rounded-full bg-ink px-5 py-2.5 font-semibold text-white hover:bg-rot">Speichern</button>
        <button type="button" onClick={onCancel} className="rounded-full border border-line px-5 py-2.5 font-semibold hover:border-ink">Abbrechen</button>
      </div>
    </form>
  );
}

function NewPost({ onMsg }: { onMsg: (m: string) => void }) {
  const [f, setF] = useState({ title: "", excerpt: "", content: "", category: "wien-leben", author_name: "Redaktion BlogWien", company: "", website_url: "", cover_image: "", is_news: true, publish: true });
  const [err, setErr] = useState<string | null>(null);
  return (
    <form
      className="card space-y-5 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await api("create", f);
        if (r.ok) {
          onMsg(f.publish ? "News veröffentlicht" : "Entwurf gespeichert");
          setF({ ...f, title: "", excerpt: "", content: "" });
        } else setErr(r.error ?? "Fehler");
      }}
    >
      <h2 className="text-2xl">News-Beitrag der Redaktion</h2>
      <p className="text-sm text-ink-2">Erscheint sofort als veröffentlichter Beitrag und, wenn markiert, im Bereich Wien-News auf der Startseite.</p>
      {err && <p className="text-sm text-rot">{err}</p>}
      <Field label="Titel"><input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required /></Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Kategorie">
          <select className="field" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Field>
        <ImageUpload value={f.cover_image} onChange={(url) => setF({ ...f, cover_image: url })} label="Titelbild (optional)" />
      </div>
      <Field label="Kurzbeschreibung"><textarea className="field" rows={2} value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} /></Field>
      <Field label="Text"><textarea className="field min-h-[20rem] font-mono text-sm" value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} required /></Field>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Autor"><input className="field" value={f.author_name} onChange={(e) => setF({ ...f, author_name: e.target.value })} /></Field>
        <Field label="Unternehmen"><input className="field" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></Field>
        <Field label="Website"><input className="field" value={f.website_url} onChange={(e) => setF({ ...f, website_url: e.target.value })} /></Field>
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_news} onChange={(e) => setF({ ...f, is_news: e.target.checked })} /> Als Wien-News markieren</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.publish} onChange={(e) => setF({ ...f, publish: e.target.checked })} /> Sofort veröffentlichen</label>
      </div>
      <button type="submit" className="rounded-full bg-ink px-5 py-2.5 font-semibold text-white hover:bg-rot">Beitrag anlegen</button>
    </form>
  );
}

function Orders() {
  const [orders, setOrders] = useState<(Order & { title: string })[]>([]);
  useEffect(() => {
    api<{ orders: (Order & { title: string })[] }>("orders").then((r) => r.ok && setOrders(r.orders));
  }, []);
  return (
    <div className="card overflow-x-auto p-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-ink-3">
            <th className="p-3">Datum</th><th className="p-3">Beitrag</th><th className="p-3">E-Mail</th><th className="p-3">Betrag</th><th className="p-3">Status</th><th className="p-3">Anbieter</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-line">
              <td className="p-3 whitespace-nowrap">{formatDate(o.created_at)}</td>
              <td className="p-3">{o.title}</td>
              <td className="p-3">{o.customer_email}</td>
              <td className="p-3">{(o.amount_cents / 100).toFixed(2)} €</td>
              <td className="p-3">{o.status === "paid" ? <span className="tag">bezahlt</span> : <span className="tag tag-rot">offen</span>}</td>
              <td className="p-3 text-ink-3">{o.provider}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td className="p-3 text-ink-2" colSpan={6}>Noch keine Bestellungen.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Settings({ onMsg }: { onMsg: (m: string) => void }) {
  const [imp, setImp] = useState<Impressum>(DEFAULT_IMPRESSUM);
  const [pw, setPw] = useState("");
  useEffect(() => {
    api<{ impressum: Impressum }>("impressum-get").then((r) => r.ok && setImp(r.impressum));
  }, []);
  const fields: [keyof Impressum, string][] = [
    ["company", "Firmenname"],
    ["legalForm", "Rechtsform (z. B. e.U., GmbH)"],
    ["owner", "Inhaber / Geschäftsführung"],
    ["street", "Straße und Hausnummer"],
    ["zip", "PLZ"],
    ["city", "Ort"],
    ["country", "Land"],
    ["phone", "Telefon"],
    ["email", "E-Mail"],
    ["uid", "UID-Nummer"],
    ["fn", "Firmenbuchnummer"],
    ["court", "Firmenbuchgericht"],
    ["authority", "Aufsichtsbehörde"],
    ["mapQuery", "Adresse für Google Maps"],
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form
        className="card space-y-4 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await api("impressum-set", imp as unknown as Record<string, unknown>);
          onMsg(r.ok ? "Impressum gespeichert" : r.error ?? "Fehler");
        }}
      >
        <h2 className="text-2xl">Impressum und Standort</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(([k, label]) => (
            <Field key={k} label={label}>
              <input className="field" value={imp[k]} onChange={(e) => setImp({ ...imp, [k]: e.target.value })} />
            </Field>
          ))}
        </div>
        <button type="submit" className="rounded-full bg-ink px-5 py-2.5 font-semibold text-white hover:bg-rot">Speichern</button>
      </form>
      <form
        className="card h-fit space-y-4 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await api("password", { password: pw });
          onMsg(r.ok ? "Passwort geändert" : r.error ?? "Fehler");
          if (r.ok) setPw("");
        }}
      >
        <h2 className="text-xl">Admin-Passwort</h2>
        <Field label="Neues Passwort (min. 8 Zeichen)"><input type="password" className="field" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></Field>
        <button type="submit" className="rounded-full border-2 border-ink px-5 py-2.5 font-semibold hover:bg-ink hover:text-white">Ändern</button>
      </form>
    </div>
  );
}
