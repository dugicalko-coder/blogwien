import { createFileRoute } from "@tanstack/react-router";
import { listPublishedSlugs } from "../lib/db.server";
import { CATEGORIES, LANDINGS, SITE_URL } from "../lib/site";

const STATIC: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/blog", priority: "0.9", changefreq: "daily" },
  { path: "/schreiben", priority: "0.8", changefreq: "monthly" },
  { path: "/preise", priority: "0.8", changefreq: "monthly" },
  { path: "/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/impressum", priority: "0.3", changefreq: "yearly" },
  { path: "/datenschutz", priority: "0.2", changefreq: "yearly" },
  { path: "/agb", priority: "0.2", changefreq: "yearly" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = SITE_URL;
        const today = new Date().toISOString().split("T")[0];
        const posts = await listPublishedSlugs();
        const entries: string[] = [];
        const add = (path: string, lastmod: string, changefreq: string, priority: string) => {
          entries.push(
            `  <url>\n    <loc>${origin}${path === "/" ? "" : path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
          );
        };
        STATIC.forEach((s) => add(s.path, today, s.changefreq, s.priority));
        LANDINGS.forEach((l) => add(`/${l.slug}`, today, "weekly", "0.8"));
        CATEGORIES.forEach((c) => add(`/kategorie/${c.slug}`, today, "daily", "0.7"));
        posts.forEach((p) => add(`/blog/${p.slug}`, (p.published_at ?? today).slice(0, 10), "monthly", "0.7"));
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=1800" },
        });
      },
    },
  },
});
