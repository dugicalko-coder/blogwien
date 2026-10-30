import { Link, createFileRoute } from "@tanstack/react-router";
import type { Post } from "../../lib/seed-types";
import { z } from "zod";
import { StructuredData } from "../../components/StructuredData";
import { PostCard } from "../../components/site/PostCard";
import { WriteCta } from "../../components/site/Shell";
import { getBlogPage } from "../../lib/api/blog.functions";
import { jsonLd, orgGraph, pageHead } from "../../lib/seo";
import { CATEGORIES, SITE_URL } from "../../lib/site";

export const Route = createFileRoute("/blog/")({
  validateSearch: z.object({ seite: z.number().int().min(1).optional() }),
  loaderDeps: ({ search }) => ({ page: search.seite ?? 1 }),
  loader: ({ deps }) => getBlogPage({ data: { page: deps.page } }),
  head: () =>
    pageHead({
      title: "Alle Beiträge: Blog Wien und Österreich | BlogWien",
      description:
        "Alle veröffentlichten Beiträge im Blog Wien: Stadtleben, Reisen, Bauen und Wohnen, Energie, Kulinarik und Wirtschaft. Täglich neue Blogpostings aus Wien und Österreich.",
      path: "/blog",
    }),
  component: BlogIndex,
});

const SCHEMA = jsonLd([
  ...orgGraph(),
  { "@type": "CollectionPage", "@id": `${SITE_URL}/blog`, name: "Alle Beiträge im Blog Wien", url: `${SITE_URL}/blog`, isPartOf: { "@id": `${SITE_URL}/#website` } },
]);

function BlogIndex() {
  const { posts, hasMore, page } = Route.useLoaderData();
  return (
    <div className="container-bw py-12">
      <StructuredData json={SCHEMA} />
      <p className="eyebrow">Blog Wien</p>
      <h1 className="mt-2 text-4xl md:text-5xl">Alle Beiträge aus Wien und Österreich</h1>
      <p className="mt-4 max-w-2xl text-ink-2">
        Hier erscheinen alle Beiträge, die die Redaktion freigegeben hat: von Wiener Unternehmen, Vereinen, Gastautorinnen und
        Gastautoren. Premium-Beiträge stehen oben.
      </p>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Kategorien">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to="/kategorie/$slug" params={{ slug: c.slug }} className="tag hover:bg-wald hover:text-white">
            {c.name}
          </Link>
        ))}
      </nav>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p: Post) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      {posts.length === 0 && <p className="mt-10 text-ink-2">Auf dieser Seite gibt es keine weiteren Beiträge.</p>}
      <div className="mt-10 flex items-center justify-between">
        {page > 1 ? (
          <Link to="/blog" search={{ seite: page - 1 }} className="font-semibold text-wald hover:text-rot">
            ← Neuere Beiträge
          </Link>
        ) : (
          <span />
        )}
        {hasMore && (
          <Link to="/blog" search={{ seite: page + 1 }} className="font-semibold text-wald hover:text-rot">
            Ältere Beiträge →
          </Link>
        )}
      </div>
      <div className="mt-16 rounded-3xl bg-paper-2 p-8 text-center">
        <h2 className="text-2xl">Ihr Beitrag fehlt noch?</h2>
        <p className="mt-2 text-ink-2">Schreiben Sie ihn jetzt, kostenlos oder als Premium-Posting mit Backlink.</p>
        <div className="mt-5">
          <WriteCta large />
        </div>
      </div>
    </div>
  );
}
