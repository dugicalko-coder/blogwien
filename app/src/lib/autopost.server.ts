// Auto-Redaktion: erzeugt einen KI-Beitrag ueber Wien (Text + Titelbild) und veroeffentlicht ihn.
// Wird 3x taeglich vom Vercel-Cron aufgerufen (siehe vercel.json und /api/cron/autopost).
import { bindings } from "./bindings.server";
import { CATEGORIES, slugify } from "./site";

const TEXT_MODEL = () => process.env.OPENAI_TEXT_MODEL || "gpt-5-mini";
const IMAGE_MODEL = () => process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

// Pro Tages-Slot eine andere Kategorie, damit die 3 Beitraege eines Tages verschieden sind.
const ROTATION = [
  ["wien-leben", "essen-trinken", "bauen-wohnen"],
  ["reisen-freizeit", "wien-leben", "energie-umwelt"],
  ["essen-trinken", "wirtschaft-marketing", "wien-leben"],
  ["bauen-wohnen", "reisen-freizeit", "essen-trinken"],
  ["energie-umwelt", "wien-leben", "wirtschaft-marketing"],
  ["wien-leben", "bauen-wohnen", "reisen-freizeit"],
  ["essen-trinken", "energie-umwelt", "wien-leben"],
];

const FALLBACK_IMAGES: Record<string, string> = {
  "wien-leben": "/assets/wien-stephansdom.jpg",
  "reisen-freizeit": "/assets/wien-donauradweg.jpg",
  "bauen-wohnen": "/assets/wien-hausbau.jpg",
  "energie-umwelt": "/assets/wien-solar.jpg",
  "essen-trinken": "/assets/wien-kaffeehaus.jpg",
  "wirtschaft-marketing": "/assets/wien-digitalagentur.jpg",
};

type Draft = { title: string; excerpt: string; content: string; image_prompt: string };

function viennaNow(): { date: string; hour: number; weekday: string; dayIndex: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("de-AT", {
    timeZone: "Europe/Vienna",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    date: `${get("day")}. ${get("month")} ${get("year")}`,
    hour: Number(get("hour")),
    weekday: get("weekday"),
    dayIndex: Math.floor(now.getTime() / 86_400_000),
  };
}

async function openai(path: string, body: unknown): Promise<Record<string, unknown>> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY fehlt");
  const res = await fetch(`https://api.openai.com/v1/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) throw new Error(`OpenAI ${path} ${res.status}: ${JSON.stringify(json).slice(0, 400)}`);
  return json;
}

async function writeDraft(category: string, recentTitles: string[]): Promise<Draft> {
  const cat = CATEGORIES.find((c) => c.slug === category)!;
  const t = viennaNow();
  const system = `Du bist Redakteur von BlogWien.at, einem Blog über Wien. Du schreibst in österreichischem Deutsch (Jänner, Erdäpfel, Paradeiser, Sackerl), Sie-Form, sachlich, hilfreich, ohne Übertreibung.
Regeln:
- Thema mit klarem Wien-Bezug, passend zur Kategorie und zur Jahreszeit.
- Keine erfundenen Fakten, Zitate, Personen, Preise, Adressen, Öffnungszeiten oder Termine. Konkrete Zahlen nur, wenn sie allgemein bekannt und dauerhaft gültig sind; sonst allgemein formulieren und auf offizielle Stellen (z. B. Stadt Wien) verweisen.
- Keine tagesaktuellen Nachrichten behaupten, die du nicht sicher kennst.
- Keine Gesundheits-, Rechts- oder Finanzversprechen, keine Werbung für einzelne Unternehmen.
- Kein Hinweis auf KI im Text (das kennzeichnet die Website automatisch).
Antworte ausschließlich als JSON-Objekt mit den Feldern title, excerpt, content, image_prompt.`;
  const user = `Heute ist ${t.weekday}, der ${t.date}.
Kategorie: ${cat.name} (${cat.description})
Bereits erschienene Titel (nicht wiederholen, kein ähnliches Thema):
${recentTitles.map((x) => `- ${x}`).join("\n")}

Schreibe einen neuen Beitrag:
- title: suchmaschinentauglich, Hauptkeyword und "Wien" weit vorne, max. 90 Zeichen
- excerpt: 140 bis 220 Zeichen
- content: 900 bis 1300 Wörter in Markdown, Zwischenüberschriften mit "## ", kurze Absätze, wo sinnvoll eine Liste mit "- ", am Ende "## Fazit". Keine H1, keine Links.
- image_prompt: englische Bildbeschreibung für ein fotorealistisches Titelbild mit Wien-Motiv passend zum Thema, ohne erkennbare Personen, ohne Schrift, ohne Logos.`;
  const json = await openai("chat/completions", {
    model: TEXT_MODEL(),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const choices = json.choices as { message: { content: string } }[];
  const draft = JSON.parse(choices[0]?.message?.content ?? "{}") as Partial<Draft>;
  if (!draft.title || !draft.excerpt || !draft.content) throw new Error("Unvollständiger Entwurf");
  const words = draft.content.trim().split(/\s+/).length;
  if (words < 500) throw new Error(`Beitrag zu kurz (${words} Wörter)`);
  return {
    title: draft.title.trim().slice(0, 160),
    excerpt: draft.excerpt.trim().slice(0, 400),
    content: draft.content.trim(),
    image_prompt: (draft.image_prompt ?? "").trim(),
  };
}

async function makeImage(prompt: string): Promise<string | null> {
  const storage = bindings().STORAGE;
  if (!storage || !prompt) return null;
  const json = await openai("images/generations", {
    model: IMAGE_MODEL(),
    prompt: `${prompt}. Photorealistic, natural light, Vienna, Austria. No people in focus, no text, no logos, no watermark.`,
    size: "1536x1024",
    quality: "medium",
    output_format: "jpeg",
    output_compression: 82,
    n: 1,
  });
  const b64 = (json.data as { b64_json?: string }[] | undefined)?.[0]?.b64_json;
  if (!b64) return null;
  const key = `${crypto.randomUUID()}.jpg`;
  await storage.put(`img/${key}`, Buffer.from(b64, "base64"), { httpMetadata: { contentType: "image/jpeg" } });
  return `/bild/${key}`;
}

export async function runAutopost(slotOverride?: number): Promise<{ ok: true; slug: string; title: string; image: string } | { ok: false; error: string }> {
  const d = bindings().DB;
  if (!d) return { ok: false, error: "Datenbank nicht verfügbar" };
  const t = viennaNow();
  const slot = slotOverride ?? (t.hour < 10 ? 0 : t.hour < 15 ? 1 : 2);
  const category = ROTATION[t.dayIndex % ROTATION.length][slot] ?? "wien-leben";

  // Schutz gegen Doppellauf: hoechstens 3 Auto-Beitraege in 20 Stunden, mindestens 2 Stunden Abstand.
  const since20h = new Date(Date.now() - 20 * 3600_000).toISOString().slice(0, 19).replace("T", " ");
  const since2h = new Date(Date.now() - 2 * 3600_000).toISOString().slice(0, 19).replace("T", " ");
  const recentAuto = await d
    .prepare("SELECT COUNT(*) AS n, COALESCE(SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END), 0) AS last2h FROM posts WHERE author_email = 'auto' AND created_at >= ?")
    .bind(since2h, since20h)
    .first<{ n: number; last2h: number }>();
  if ((recentAuto?.n ?? 0) >= 3) return { ok: false, error: "Tageslimit von 3 Beiträgen erreicht" };
  if ((recentAuto?.last2h ?? 0) > 0 && slotOverride === undefined) return { ok: false, error: "Letzter Beitrag ist jünger als 2 Stunden" };

  const recent = await d.prepare("SELECT title FROM posts ORDER BY id DESC LIMIT 60").all<{ title: string }>();
  const draft = await writeDraft(category, (recent.results ?? []).map((r) => r.title));

  let image = FALLBACK_IMAGES[category] ?? "/assets/wien-stephansdom.jpg";
  try {
    image = (await makeImage(draft.image_prompt)) ?? image;
  } catch (e) {
    console.error("autopost image", e);
  }

  let slug = slugify(draft.title) || `wien-${Date.now().toString(36)}`;
  const exists = await d.prepare("SELECT 1 FROM posts WHERE slug = ?").bind(slug).first();
  if (exists) slug = `${slug}-${Date.now().toString(36)}`.slice(0, 100);

  await d
    .prepare(
      `INSERT INTO posts (slug, title, excerpt, content, category, author_name, author_email, company, website_url, backlink, premium, is_news, status, cover_image, created_at, published_at, ai_generated)
       VALUES (?, ?, ?, ?, ?, 'Redaktion BlogWien', 'auto', '', '', 0, 0, 1, 'published', ?, datetime('now'), datetime('now'), 1)`,
    )
    .bind(slug, draft.title, draft.excerpt, draft.content, category, image)
    .run();
  return { ok: true, slug, title: draft.title, image };
}
