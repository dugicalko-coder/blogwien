// Server-only data access for BlogWien (Cloudflare D1).
import { bindings, type Database as D1Database } from "./bindings.server";
import { SEED_POSTS, SEED_AS_POSTS } from "./seed-posts";
import { AUTO_BATCHES } from "./auto-posts";
import type { Order, Post } from "./seed-types";
import { DEFAULT_IMPRESSUM, type Impressum } from "./site";

export const DEFAULT_ADMIN_PASSWORD = "BlogWien2026!";

function db(): D1Database | null {
  return bindings().DB ?? null;
}

// ---------- Hilfsfunktionen ----------

export async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------- Settings ----------

export async function getSetting(key: string): Promise<string | null> {
  const d = db();
  if (!d) return null;
  const row = await d.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const d = db();
  if (!d) return;
  await d
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .bind(key, value)
    .run();
}

export async function getImpressum(): Promise<Impressum> {
  const raw = await getSetting("impressum");
  if (!raw) return DEFAULT_IMPRESSUM;
  try {
    return { ...DEFAULT_IMPRESSUM, ...(JSON.parse(raw) as Partial<Impressum>) };
  } catch {
    return DEFAULT_IMPRESSUM;
  }
}


// ---------- KI-Kennzeichnung & Auto-Redaktion ----------

// Sichtbar = freigegeben UND Veroeffentlichungszeitpunkt erreicht (geplante Beitraege bleiben bis dahin unsichtbar).
const LIVE = "status = 'published' AND (published_at IS NULL OR published_at <= datetime('now'))";

async function ensureAiColumn(d: D1Database): Promise<void> {
  if ((await getSetting("ai_col_v1")) === "1") return;
  // Redaktionsbeitraege aus dem Seed wurden KI-gestuetzt erstellt und werden gekennzeichnet.
  const mark = d.prepare("UPDATE posts SET ai_generated = 1 WHERE slug = ?");
  await d.batch([
    ...SEED_POSTS.map((p) => mark.bind(p.slug)),
    d.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('ai_col_v1', '1')"),
  ]);
}

async function syncAutoPosts(d: D1Database): Promise<void> {
  if (!AUTO_BATCHES.length) return;
  const res = await d.prepare("SELECT key FROM settings WHERE key LIKE 'auto_batch_%'").all<{ key: string }>();
  const done = new Set((res.results ?? []).map((r) => r.key));
  const ins = d.prepare(
    `INSERT OR IGNORE INTO posts (slug, title, excerpt, content, category, author_name, author_email, company, website_url, backlink, premium, is_news, status, cover_image, created_at, published_at, ai_generated)
     VALUES (?, ?, ?, ?, ?, ?, 'auto', '', '', 0, 0, ?, 'published', ?, ?, ?, 1)`,
  );
  for (const b of AUTO_BATCHES) {
    const key = "auto_batch_" + b.id;
    if (done.has(key) || !b.posts.length) continue;
    await d.batch([
      ...b.posts.map((p) =>
        ins.bind(p.slug, p.title, p.excerpt, p.content, p.category, p.author_name ?? "Redaktion BlogWien", p.is_news ?? 1, p.cover_image ?? "", p.published_at, p.published_at),
      ),
      d.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, '1')").bind(key),
    ]);
  }
}

// ---------- Seeding ----------

let seededInThisIsolate = false;

export async function ensureSeeded(): Promise<void> {
  const d = db();
  if (!d || seededInThisIsolate) return;
  const flag = await getSetting("seeded_v1");
  if (flag === "1") {
    if ((await getSetting("seed_sync_v3")) !== "1") {
      const ins = d.prepare(
        `INSERT OR IGNORE INTO posts (slug, title, excerpt, content, category, author_name, author_email, company, website_url, backlink, premium, is_news, status, cover_image, created_at, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)`,
      );
      const upd = d.prepare("UPDATE posts SET cover_image = ?, content = ?, excerpt = ? WHERE slug = ? AND (cover_image = '' OR cover_image LIKE '/assets/%')");
      await d.batch([
        ...SEED_POSTS.map((p) =>
          ins.bind(
            p.slug, p.title, p.excerpt, p.content, p.category,
            p.author_name ?? "Redaktion BlogWien", p.author_email ?? "", p.company ?? "", p.website_url ?? "",
            p.backlink ?? 0, p.premium ?? (p.backlink ? 1 : 0), p.is_news ?? 0, p.cover_image ?? "", p.published_at, p.published_at,
          ),
        ),
        ...SEED_POSTS.map((p) => upd.bind(p.cover_image ?? "", p.content, p.excerpt, p.slug)),
        d.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seed_sync_v3', '1')"),
      ]);
    }
    try {
      await ensureAiColumn(d);
      await syncAutoPosts(d);
    } catch (e) {
      console.error("auto-redaktion sync", e);
    }
    if ((await getSetting("admin_reset_v1")) !== "1") {
      // Einmaliges Zuruecksetzen auf das Standard-Passwort (vom Betreiber angefordert, 10/2026).
      await setAdminPassword(DEFAULT_ADMIN_PASSWORD);
      await setSetting("admin_reset_v1", "1");
    }
    seededInThisIsolate = true;
    return;
  }
  const stmt = d.prepare(
    `INSERT OR IGNORE INTO posts (slug, title, excerpt, content, category, author_name, author_email, company, website_url, backlink, premium, is_news, status, cover_image, created_at, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)`,
  );
  const batch = SEED_POSTS.map((p) =>
    stmt.bind(
      p.slug,
      p.title,
      p.excerpt,
      p.content,
      p.category,
      p.author_name ?? "Redaktion BlogWien",
      p.author_email ?? "",
      p.company ?? "",
      p.website_url ?? "",
      p.backlink ?? 0,
      p.premium ?? (p.backlink ? 1 : 0),
      p.is_news ?? 0,
      p.cover_image ?? "",
      p.published_at,
      p.published_at,
    ),
  );
  await d.batch(batch);
  const pwHash = await sha256("blogwien:" + DEFAULT_ADMIN_PASSWORD);
  await d.batch([
    d.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password_hash', ?)").bind(pwHash),
    d.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('session_secret', ?)").bind(crypto.randomUUID() + crypto.randomUUID()),
    d.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('seeded_v1', '1')"),
  ]);
  seededInThisIsolate = true;
}

// ---------- Posts (oeffentlich) ----------

const POST_COLS =
  "id, slug, title, excerpt, content, category, author_name, author_email, company, website_url, backlink, premium, is_news, status, cover_image, views, created_at, published_at, ai_generated";

export async function listPublished(opts: { category?: string; limit?: number; offset?: number; news?: boolean } = {}): Promise<Post[]> {
  const d = db();
  const limit = opts.limit ?? 24;
  const offset = opts.offset ?? 0;
  if (!d) {
    let rows = SEED_AS_POSTS.slice().sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    if (opts.category) rows = rows.filter((r) => r.category === opts.category);
    if (opts.news) rows = rows.filter((r) => r.is_news === 1);
    return rows.slice(offset, offset + limit);
  }
  await ensureSeeded();
  const where = [LIVE];
  const params: unknown[] = [];
  if (opts.category) {
    where.push("category = ?");
    params.push(opts.category);
  }
  if (opts.news) where.push("is_news = 1");
  const sql = `SELECT ${POST_COLS} FROM posts WHERE ${where.join(" AND ")} ORDER BY premium DESC, published_at DESC LIMIT ? OFFSET ?`;
  const res = await d
    .prepare(sql)
    .bind(...params, limit, offset)
    .all<Post>();
  return res.results ?? [];
}

export async function listLatest(limit = 6): Promise<Post[]> {
  const d = db();
  if (!d) return SEED_AS_POSTS.slice().sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? "")).slice(0, limit);
  await ensureSeeded();
  const res = await d
    .prepare(`SELECT ${POST_COLS} FROM posts WHERE ${LIVE} ORDER BY published_at DESC LIMIT ?`)
    .bind(limit)
    .all<Post>();
  return res.results ?? [];
}

export async function countPublished(): Promise<number> {
  const d = db();
  if (!d) return SEED_AS_POSTS.length;
  await ensureSeeded();
  const row = await d.prepare(`SELECT COUNT(*) AS n FROM posts WHERE ${LIVE}`).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function getPublishedBySlug(slug: string): Promise<Post | null> {
  const d = db();
  if (!d) return SEED_AS_POSTS.find((p) => p.slug === slug) ?? null;
  await ensureSeeded();
  const row = await d.prepare(`SELECT ${POST_COLS} FROM posts WHERE slug = ? AND ${LIVE}`).bind(slug).first<Post>();
  if (row) {
    await d.prepare("UPDATE posts SET views = views + 1 WHERE id = ?").bind(row.id).run();
  }
  return row ?? null;
}

export async function listPublishedSlugs(): Promise<{ slug: string; published_at: string | null; category: string }[]> {
  const d = db();
  if (!d) return SEED_AS_POSTS.map((p) => ({ slug: p.slug, published_at: p.published_at, category: p.category }));
  await ensureSeeded();
  const res = await d.prepare(`SELECT slug, published_at, category FROM posts WHERE ${LIVE} ORDER BY published_at DESC`).all<{ slug: string; published_at: string | null; category: string }>();
  return res.results ?? [];
}

// ---------- Einreichung + Bestellung ----------

export type NewPostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author_name: string;
  author_email: string;
  company: string;
  website_url: string;
  cover_image: string;
  premium: boolean;
};

export async function createSubmission(input: NewPostInput): Promise<{ postId: number; slug: string }> {
  const d = db();
  if (!d) throw new Error("Datenbank nicht verfügbar");
  await ensureSeeded();
  let slug = input.slug;
  const exists = await d.prepare("SELECT 1 FROM posts WHERE slug = ?").bind(slug).first();
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;
  const status = input.premium ? "draft" : "pending"; // Premium wird erst nach Zahlung zu "pending"
  const res = await d
    .prepare(
      `INSERT INTO posts (slug, title, excerpt, content, category, author_name, author_email, company, website_url, backlink, premium, is_news, status, cover_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    )
    .bind(
      slug,
      input.title,
      input.excerpt,
      input.content,
      input.category,
      input.author_name,
      input.author_email,
      input.company,
      input.website_url,
      input.premium ? 1 : 0,
      input.premium ? 1 : 0,
      status,
      input.cover_image,
    )
    .run();
  const postId = Number(res.meta.last_row_id);
  return { postId, slug };
}

export async function createOrder(postId: number, email: string): Promise<Order> {
  const d = db();
  if (!d) throw new Error("Datenbank nicht verfügbar");
  const id = crypto.randomUUID();
  await d
    .prepare("INSERT INTO orders (id, post_id, amount_cents, currency, status, provider, customer_email) VALUES (?, ?, 9900, 'EUR', 'open', 'demo', ?)")
    .bind(id, postId, email)
    .run();
  const row = await d.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<Order>();
  if (!row) throw new Error("Bestellung nicht gefunden");
  return row;
}

export async function getOrderWithPost(orderId: string): Promise<{ order: Order; post: Post } | null> {
  const d = db();
  if (!d) return null;
  const order = await d.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first<Order>();
  if (!order) return null;
  const post = await d.prepare(`SELECT ${POST_COLS} FROM posts WHERE id = ?`).bind(order.post_id).first<Post>();
  if (!post) return null;
  return { order, post };
}

export async function markOrderPaid(orderId: string, provider: string): Promise<boolean> {
  const d = db();
  if (!d) return false;
  const order = await d.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first<Order>();
  if (!order) return false;
  if (order.status === "paid") return true;
  await d.batch([
    d.prepare("UPDATE orders SET status = 'paid', provider = ?, paid_at = datetime('now') WHERE id = ?").bind(provider, orderId),
    d.prepare("UPDATE posts SET status = 'pending', premium = 1, backlink = 1 WHERE id = ? AND status = 'draft'").bind(order.post_id),
  ]);
  return true;
}

// ---------- Admin ----------

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = await getSetting("admin_password_hash");
  const hash = await sha256("blogwien:" + password);
  if (!stored) return password === DEFAULT_ADMIN_PASSWORD;
  return stored === hash;
}

export async function setAdminPassword(password: string): Promise<void> {
  await setSetting("admin_password_hash", await sha256("blogwien:" + password));
}

async function sessionSecret(): Promise<string> {
  let s = await getSetting("session_secret");
  if (!s) {
    s = crypto.randomUUID() + crypto.randomUUID();
    await setSetting("session_secret", s);
  }
  return s;
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const sig = await hmac(await sessionSecret(), `admin:${exp}`);
  return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now()) return false;
  const expected = await hmac(await sessionSecret(), `admin:${exp}`);
  return expected === sig;
}

export async function adminListPosts(status: string | "all"): Promise<Post[]> {
  const d = db();
  if (!d) return [];
  await ensureSeeded();
  const sql =
    status === "all"
      ? `SELECT ${POST_COLS} FROM posts ORDER BY created_at DESC LIMIT 300`
      : `SELECT ${POST_COLS} FROM posts WHERE status = ? ORDER BY created_at DESC LIMIT 300`;
  const stmt = status === "all" ? d.prepare(sql) : d.prepare(sql).bind(status);
  const res = await stmt.all<Post>();
  return res.results ?? [];
}

export async function adminGetPost(id: number): Promise<Post | null> {
  const d = db();
  if (!d) return null;
  return (await d.prepare(`SELECT ${POST_COLS} FROM posts WHERE id = ?`).bind(id).first<Post>()) ?? null;
}

export async function adminSetStatus(id: number, status: string): Promise<void> {
  const d = db();
  if (!d) return;
  if (status === "published") {
    await d.prepare("UPDATE posts SET status = 'published', published_at = COALESCE(published_at, datetime('now')) WHERE id = ?").bind(id).run();
  } else {
    await d.prepare("UPDATE posts SET status = ? WHERE id = ?").bind(status, id).run();
  }
}

export type PostPatch = Partial<Pick<Post, "title" | "slug" | "excerpt" | "content" | "category" | "author_name" | "company" | "website_url" | "backlink" | "premium" | "is_news" | "cover_image" | "status">>;

export async function adminUpdatePost(id: number, patch: PostPatch): Promise<void> {
  const d = db();
  if (!d) return;
  const keys = Object.keys(patch) as (keyof PostPatch)[];
  if (keys.length === 0) return;
  const sets = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => patch[k] as unknown);
  await d.prepare(`UPDATE posts SET ${sets} WHERE id = ?`).bind(...values, id).run();
  if (patch.status === "published") {
    await d.prepare("UPDATE posts SET published_at = COALESCE(published_at, datetime('now')) WHERE id = ?").bind(id).run();
  }
}

export async function adminCreatePost(input: Omit<NewPostInput, "premium"> & { is_news: boolean; publish: boolean }): Promise<number> {
  const d = db();
  if (!d) throw new Error("Datenbank nicht verfügbar");
  await ensureSeeded();
  let slug = input.slug;
  const exists = await d.prepare("SELECT 1 FROM posts WHERE slug = ?").bind(slug).first();
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;
  const res = await d
    .prepare(
      `INSERT INTO posts (slug, title, excerpt, content, category, author_name, author_email, company, website_url, backlink, premium, is_news, status, cover_image, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
    )
    .bind(
      slug,
      input.title,
      input.excerpt,
      input.content,
      input.category,
      input.author_name,
      input.author_email,
      input.company,
      input.website_url,
      input.website_url ? 1 : 0,
      input.is_news ? 1 : 0,
      input.publish ? "published" : "draft",
      input.cover_image,
      input.publish ? new Date().toISOString().slice(0, 19).replace("T", " ") : null,
    )
    .run();
  return Number(res.meta.last_row_id);
}

export async function adminDeletePost(id: number): Promise<void> {
  const d = db();
  if (!d) return;
  await d.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
}

export async function adminListOrders(): Promise<(Order & { title: string })[]> {
  const d = db();
  if (!d) return [];
  const res = await d
    .prepare("SELECT o.*, p.title AS title FROM orders o LEFT JOIN posts p ON p.id = o.post_id ORDER BY o.created_at DESC LIMIT 200")
    .all<Order & { title: string }>();
  return res.results ?? [];
}

export async function adminStats(): Promise<{ published: number; pending: number; drafts: number; paid: number; revenue_cents: number }> {
  const d = db();
  if (!d) return { published: SEED_AS_POSTS.length, pending: 0, drafts: 0, paid: 0, revenue_cents: 0 };
  await ensureSeeded();
  const p = await d
    .prepare("SELECT SUM(status='published') AS published, SUM(status='pending') AS pending, SUM(status='draft') AS drafts FROM posts")
    .first<{ published: number; pending: number; drafts: number }>();
  const o = await d.prepare("SELECT COUNT(*) AS paid, COALESCE(SUM(amount_cents),0) AS revenue FROM orders WHERE status='paid'").first<{ paid: number; revenue: number }>();
  return {
    published: p?.published ?? 0,
    pending: p?.pending ?? 0,
    drafts: p?.drafts ?? 0,
    paid: o?.paid ?? 0,
    revenue_cents: o?.revenue ?? 0,
  };
}
