import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createOrder, createSubmission } from "../../lib/db.server";
import { CATEGORIES, slugify } from "../../lib/site";

const Body = z.object({
  title: z.string().trim().min(10).max(140),
  excerpt: z.string().trim().min(30).max(300),
  content: z.string().trim().min(600).max(40000),
  category: z.string().refine((c) => CATEGORIES.some((k) => k.slug === c), "Ungültige Kategorie"),
  author_name: z.string().trim().min(2).max(80),
  author_email: z.string().trim().email().max(120),
  company: z.string().trim().max(120).default(""),
  website_url: z.string().trim().max(200).default(""),
  cover_image: z.string().trim().max(500).default(""),
  premium: z.boolean().default(false),
  agb: z.literal(true),
  hp: z.string().max(0).optional(),
});

function normalizeUrl(u: string): string {
  if (!u) return "";
  const v = /^https?:\/\//i.test(u) ? u : `https://${u}`;
  try {
    const url = new URL(v);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export const Route = createFileRoute("/api/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Ungültige Anfrage" }, { status: 400 });
        }
        const parsed = Body.safeParse(json);
        if (!parsed.success) {
          const first = parsed.error.issues[0];
          return Response.json({ ok: false, error: `${first?.path.join(".") ?? "Feld"}: ${first?.message ?? "ungültig"}` }, { status: 400 });
        }
        const d = parsed.data;
        const website = normalizeUrl(d.website_url);
        const cover = d.cover_image && /^(https:\/\/|\/bild\/)/.test(d.cover_image) ? d.cover_image : "";
        try {
          const { postId, slug } = await createSubmission({
            title: d.title,
            slug: slugify(d.title) || `beitrag-${Date.now().toString(36)}`,
            excerpt: d.excerpt,
            content: d.content,
            category: d.category,
            author_name: d.author_name,
            author_email: d.author_email,
            company: d.company,
            website_url: website,
            cover_image: cover,
            premium: d.premium,
          });
          if (d.premium) {
            const order = await createOrder(postId, d.author_email);
            return Response.json({ ok: true, premium: true, orderId: order.id, slug });
          }
          return Response.json({ ok: true, premium: false, slug });
        } catch (e) {
          console.error(e);
          return Response.json({ ok: false, error: "Speichern fehlgeschlagen. Bitte später erneut versuchen." }, { status: 500 });
        }
      },
    },
  },
});
