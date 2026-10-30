import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import type { Post } from "../../lib/seed-types";
import { StructuredData } from "../../components/StructuredData";
import { Content } from "../../components/site/Content";
import { PostCard } from "../../components/site/PostCard";
import { WriteCta } from "../../components/site/Shell";
import { getPost } from "../../lib/api/blog.functions";
import { jsonLd, orgGraph, pageHead } from "../../lib/seo";
import { categoryBySlug, formatDate, readingTime, SITE_URL } from "../../lib/site";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const res = await getPost({ data: { slug: params.slug } });
    if (!res.post) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return {};
    const cat = categoryBySlug(post.category);
    return pageHead({
      title: `${post.title.length > 58 ? post.title.slice(0, 55) + "…" : post.title} | BlogWien`,
      description: post.excerpt.slice(0, 158),
      path: `/blog/${post.slug}`,
      image: `${SITE_URL}${post.cover_image || cat.image}`,
      type: "article",
    });
  },
  component: PostPage,
});

function PostPage() {
  const { post, related } = Route.useLoaderData();
  const cat = categoryBySlug(post!.category);
  const p = post!;
  const img = p.cover_image || cat.image;
  const schema = jsonLd([
    ...orgGraph(),
    {
      "@type": "BlogPosting",
      "@id": `${SITE_URL}/blog/${p.slug}`,
      headline: p.title,
      description: p.excerpt,
      image: `${SITE_URL}${img}`,
      datePublished: p.published_at ?? p.created_at,
      dateModified: p.published_at ?? p.created_at,
      inLanguage: "de-AT",
      articleSection: cat.name,
      author: p.company
        ? { "@type": "Organization", name: p.company, url: p.website_url || undefined }
        : { "@type": "Person", name: p.author_name },
      publisher: { "@id": `${SITE_URL}/#org` },
      mainEntityOfPage: `${SITE_URL}/blog/${p.slug}`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "BlogWien", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: cat.name, item: `${SITE_URL}/kategorie/${cat.slug}` },
        { "@type": "ListItem", position: 3, name: p.title, item: `${SITE_URL}/blog/${p.slug}` },
      ],
    },
  ]);
  const nofollow = p.premium !== 1 && p.backlink !== 1;
  const isAi = p.ai_generated === 1;

  return (
    <article className="pb-16">
      <StructuredData json={schema} />
      <div className="container-bw pt-10">
        <nav aria-label="Brotkrumen" className="text-sm text-ink-3">
          <Link to="/" className="hover:text-rot">BlogWien</Link> <span aria-hidden>›</span>{" "}
          <Link to="/kategorie/$slug" params={{ slug: cat.slug }} className="hover:text-rot">{cat.name}</Link>
        </nav>
        <div className="mx-auto mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/kategorie/$slug" params={{ slug: cat.slug }} className="tag">{cat.name}</Link>
            {p.premium === 1 && <span className="tag tag-rot">Premium-Beitrag</span>}
            {p.is_news === 1 && <span className="tag bg-gold/20 text-ink">Wien-News</span>}
            {isAi && <span className="tag bg-ink/5 text-ink">KI-generiert</span>}
          </div>
          <h1 className="mt-4 text-3xl leading-tight md:text-5xl">{p.title}</h1>
          <p className="mt-4 text-lg text-ink-2">{p.excerpt}</p>
          <p className="mt-4 text-sm text-ink-3">
            Von <span className="font-semibold text-ink">{p.author_name}</span>
            {p.company ? ` (${p.company})` : ""} · {formatDate(p.published_at)} · {readingTime(p.content)} Min. Lesezeit
          </p>
        </div>
        <img src={img} alt={p.title} width={1280} height={720} className="mx-auto mt-8 aspect-[16/9] w-full max-w-4xl rounded-3xl border border-line object-cover" />
        <div className="mx-auto mt-10 max-w-3xl">
          {isAi && (
            <aside role="note" aria-label="KI-Hinweis" className="mb-8 rounded-2xl border border-line bg-paper-2 p-5 text-sm text-ink-2">
              <p className="font-semibold text-ink">Hinweis: KI-generierter Inhalt</p>
              <p className="mt-1">
                Dieser Beitrag wurde mithilfe künstlicher Intelligenz erstellt (Text und Titelbild). Er dient der allgemeinen Information
                und ersetzt keine fachliche Beratung. Angaben wie Preise, Termine oder Öffnungszeiten können sich ändern. Fehler
                melden Sie bitte an <a href="mailto:office@blogwien.at" className="font-semibold text-wald underline underline-offset-4">office@blogwien.at</a>.
              </p>
            </aside>
          )}
          <Content text={p.content} nofollow={nofollow} />
          {(p.company || p.website_url) && (
            <aside className="mt-10 rounded-2xl border border-line bg-paper-2 p-6">
              <p className="eyebrow">Über den Autor</p>
              <p className="mt-2 font-semibold">{p.company || p.author_name}</p>
              {p.website_url && (
                <p className="mt-1">
                  <a href={p.website_url} target="_blank" rel={nofollow ? "nofollow noopener" : "noopener"} className="text-wald underline underline-offset-4 hover:text-rot">
                    {p.website_url.replace(/^https?:\/\//, "")}
                  </a>
                </p>
              )}
            </aside>
          )}
          <div className="mt-10 rounded-2xl bg-ink p-6 text-paper">
            <h2 className="text-2xl">Auch etwas zu sagen?</h2>
            <p className="mt-2 text-paper/75">Schreiben Sie Ihren eigenen Beitrag im Blog Wien, kostenlos oder als Premium-Posting mit Backlink.</p>
            <div className="mt-4"><WriteCta /></div>
          </div>
        </div>
        {related.length > 0 && (
          <section className="mx-auto mt-16 max-w-6xl" aria-labelledby="mehr">
            <h2 id="mehr" className="text-2xl">Mehr aus {cat.name}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((r: Post) => (
                <PostCard key={r.id} post={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
