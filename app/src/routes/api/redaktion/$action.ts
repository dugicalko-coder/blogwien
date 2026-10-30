import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  adminCreatePost,
  adminDeletePost,
  adminGetPost,
  adminListOrders,
  adminListPosts,
  adminSetStatus,
  adminStats,
  adminUpdatePost,
  createSessionToken,
  getImpressum,
  setAdminPassword,
  setSetting,
  verifyAdminPassword,
  verifySessionToken,
} from "../../../lib/db.server";
import { CATEGORIES, DEFAULT_IMPRESSUM, slugify } from "../../../lib/site";

const COOKIE = "bw_admin";

function readCookie(request: Request): string | undefined {
  const raw = request.headers.get("cookie") ?? "";
  const m = raw.split(";").map((s) => s.trim()).find((s) => s.startsWith(COOKIE + "="));
  return m ? decodeURIComponent(m.slice(COOKIE.length + 1)) : undefined;
}

function json(data: unknown, init: ResponseInit = {}): Response {
  return Response.json(data, { ...init, headers: { "Cache-Control": "no-store", ...(init.headers ?? {}) } });
}

const PatchSchema = z.object({
  id: z.number().int(),
  title: z.string().trim().min(3).max(160).optional(),
  slug: z.string().trim().min(3).max(120).optional(),
  excerpt: z.string().trim().max(400).optional(),
  content: z.string().trim().max(60000).optional(),
  category: z.string().refine((c) => CATEGORIES.some((k) => k.slug === c)).optional(),
  author_name: z.string().trim().max(80).optional(),
  company: z.string().trim().max(120).optional(),
  website_url: z.string().trim().max(200).optional(),
  cover_image: z.string().trim().max(500).optional(),
  backlink: z.number().int().min(0).max(1).optional(),
  premium: z.number().int().min(0).max(1).optional(),
  is_news: z.number().int().min(0).max(1).optional(),
  status: z.enum(["draft", "pending", "published", "rejected"]).optional(),
});

const CreateSchema = z.object({
  title: z.string().trim().min(3).max(160),
  excerpt: z.string().trim().max(400).default(""),
  content: z.string().trim().min(1).max(60000),
  category: z.string().refine((c) => CATEGORIES.some((k) => k.slug === c)),
  author_name: z.string().trim().max(80).default("Redaktion BlogWien"),
  company: z.string().trim().max(120).default(""),
  website_url: z.string().trim().max(200).default(""),
  cover_image: z.string().trim().max(500).default(""),
  is_news: z.boolean().default(true),
  publish: z.boolean().default(true),
});

const ImpressumSchema = z.object({
  company: z.string().trim().max(120),
  legalForm: z.string().trim().max(80),
  owner: z.string().trim().max(120),
  street: z.string().trim().max(120),
  zip: z.string().trim().max(10),
  city: z.string().trim().max(80),
  country: z.string().trim().max(80),
  phone: z.string().trim().max(40),
  email: z.string().trim().max(120),
  uid: z.string().trim().max(30),
  fn: z.string().trim().max(30),
  court: z.string().trim().max(120),
  authority: z.string().trim().max(120),
  mapQuery: z.string().trim().max(200),
});

export const Route = createFileRoute("/api/redaktion/$action")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const action = params.action;
        let body: Record<string, unknown> = {};
        try {
          const t = await request.text();
          body = t ? (JSON.parse(t) as Record<string, unknown>) : {};
        } catch {
          return json({ ok: false, error: "Ungültige Anfrage" }, { status: 400 });
        }

        if (action === "login") {
          const pw = typeof body.password === "string" ? body.password : "";
          if (!pw || !(await verifyAdminPassword(pw))) {
            return json({ ok: false, error: "Passwort falsch" }, { status: 401 });
          }
          const token = await createSessionToken();
          return json(
            { ok: true },
            { headers: { "Set-Cookie": `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}` } },
          );
        }
        if (action === "logout") {
          return json({ ok: true }, { headers: { "Set-Cookie": `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
        }

        const authed = await verifySessionToken(readCookie(request));
        if (action === "me") return json({ ok: true, authed });
        if (!authed) return json({ ok: false, error: "Nicht angemeldet" }, { status: 401 });

        switch (action) {
          case "stats":
            return json({ ok: true, stats: await adminStats() });
          case "posts": {
            const status = typeof body.status === "string" ? body.status : "pending";
            return json({ ok: true, posts: await adminListPosts(status) });
          }
          case "post": {
            const id = Number(body.id);
            if (!id) return json({ ok: false, error: "id fehlt" }, { status: 400 });
            return json({ ok: true, post: await adminGetPost(id) });
          }
          case "status": {
            const id = Number(body.id);
            const status = String(body.status ?? "");
            if (!id || !["draft", "pending", "published", "rejected"].includes(status)) return json({ ok: false, error: "ungültig" }, { status: 400 });
            await adminSetStatus(id, status);
            return json({ ok: true });
          }
          case "update": {
            const parsed = PatchSchema.safeParse(body);
            if (!parsed.success) return json({ ok: false, error: parsed.error.issues[0]?.message ?? "ungültig" }, { status: 400 });
            const { id, ...patch } = parsed.data;
            if (patch.slug) patch.slug = slugify(patch.slug);
            await adminUpdatePost(id, patch);
            return json({ ok: true });
          }
          case "create": {
            const parsed = CreateSchema.safeParse(body);
            if (!parsed.success) return json({ ok: false, error: parsed.error.issues[0]?.message ?? "ungültig" }, { status: 400 });
            const d = parsed.data;
            const id = await adminCreatePost({
              ...d,
              slug: slugify(d.title) || `news-${Date.now().toString(36)}`,
              author_email: "",
            });
            return json({ ok: true, id });
          }
          case "remove": {
            const id = Number(body.id);
            if (!id) return json({ ok: false, error: "id fehlt" }, { status: 400 });
            await adminDeletePost(id);
            return json({ ok: true });
          }
          case "orders":
            return json({ ok: true, orders: await adminListOrders() });
          case "impressum-get":
            return json({ ok: true, impressum: await getImpressum() });
          case "impressum-set": {
            const parsed = ImpressumSchema.safeParse({ ...DEFAULT_IMPRESSUM, ...body });
            if (!parsed.success) return json({ ok: false, error: parsed.error.issues[0]?.message ?? "ungültig" }, { status: 400 });
            await setSetting("impressum", JSON.stringify(parsed.data));
            return json({ ok: true });
          }
          case "password": {
            const pw = typeof body.password === "string" ? body.password : "";
            if (pw.length < 8) return json({ ok: false, error: "Mindestens 8 Zeichen" }, { status: 400 });
            await setAdminPassword(pw);
            return json({ ok: true });
          }
          default:
            return json({ ok: false, error: "Unbekannte Aktion" }, { status: 404 });
        }
      },
    },
  },
});
