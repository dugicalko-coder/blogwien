import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import type { Post } from "../../lib/seed-types";
import { StructuredData } from "../../components/StructuredData";
import { PostCard } from "../../components/site/PostCard";
import { WriteCta } from "../../components/site/Shell";
import { getBlogPage } from "../../lib/api/blog.functions";
import { jsonLd, orgGraph, pageHead } from "../../lib/seo";
import { CATEGORIES, SITE_URL } from "../../lib/site";

export const Route = createFileRoute("/kategorie/$slug")({
  loader: async ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    const page = await getBlogPage({ data: { category: cat.slug, page: 1 } });
    return { cat, posts: page.posts };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { cat } = loaderData;
    return pageHead({
      title: `${cat.name} in Wien: Beiträge und Tipps | BlogWien`,
      description: `${cat.description} Beiträge aus Wien und Österreich im Blog Wien, geschrieben von Unternehmen, Vereinen und Gastautoren.`,
      path: `/kategorie/${cat.slug}`,
      image: `${SITE_URL}${cat.image}`,
    });
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, posts } = Route.useLoaderData();
  const schema = jsonLd([
    ...orgGraph(),
    { "@type": "CollectionPage", "@id": `${SITE_URL}/kategorie/${cat.slug}`, name: `${cat.name} im Blog Wien`, url: `${SITE_URL}/kategorie/${cat.slug}`, description: cat.description, isPartOf: { "@id": `${SITE_URL}/#website` } },
  ]);
  return (
    <div className="container-bw py-12">
      <StructuredData json={schema} />
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="eyebrow">Kategorie</p>
          <h1 className="mt-2 text-4xl md:text-5xl">{cat.name} in Wien und Österreich</h1>
          <p className="mt-4 text-lg text-ink-2">{cat.description}</p>
          <div className="mt-6"><WriteCta /></div>
        </div>
        <img src={cat.image} alt={`Illustration ${cat.name}`} width={1280} height={720} className="aspect-[16/9] w-full rounded-3xl border border-line object-cover" />
      </div>
      <nav className="mt-10 flex flex-wrap gap-2" aria-label="Weitere Kategorien">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to="/kategorie/$slug" params={{ slug: c.slug }} className={c.slug === cat.slug ? "tag bg-wald text-white" : "tag hover:bg-wald hover:text-white"}>
            {c.name}
          </Link>
        ))}
      </nav>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p: Post) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      {posts.length === 0 && <p className="mt-8 text-ink-2">In dieser Kategorie gibt es noch keine Beiträge. Schreiben Sie den ersten.</p>}
    </div>
  );
}
