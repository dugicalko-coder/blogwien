import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import type { Post } from "../lib/seed-types";
import type { Landing } from "../lib/site";
import { StructuredData } from "../components/StructuredData";
import { Faq, faqJsonLd } from "../components/site/Faq";
import { PostCard } from "../components/site/PostCard";
import { WriteCta } from "../components/site/Shell";
import { getBlogPage } from "../lib/api/blog.functions";
import { jsonLd, orgGraph, pageHead } from "../lib/seo";
import { LANDINGS, PRICE_EUR, SITE_URL, landingBySlug } from "../lib/site";

export const Route = createFileRoute("/$seite")({
  loader: async ({ params }) => {
    const landing = landingBySlug(params.seite);
    if (!landing) throw notFound();
    const page = await getBlogPage({ data: { page: 1 } });
    return { landing, posts: page.posts.slice(0, 3) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { landing } = loaderData;
    return pageHead({ title: `${landing.title} | BlogWien`, description: landing.description, path: `/${landing.slug}` });
  },
  component: LandingPage,
});

function LandingPage() {
  const { landing, posts } = Route.useLoaderData();
  const schema = jsonLd([
    ...orgGraph(),
    {
      "@type": "Service",
      "@id": `${SITE_URL}/${landing.slug}#service`,
      name: landing.h1,
      description: landing.description,
      provider: { "@id": `${SITE_URL}/#org` },
      areaServed: "Wien, Österreich",
      offers: { "@type": "Offer", price: String(PRICE_EUR), priceCurrency: "EUR", url: `${SITE_URL}/schreiben` },
    },
    faqJsonLd(landing.faq),
  ]);
  return (
    <div className="container-bw py-12">
      <StructuredData json={schema} />
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">BlogWien</p>
        <h1 className="mt-2 text-4xl md:text-5xl">{landing.h1}</h1>
        <p className="mt-5 text-lg text-ink-2">{landing.intro}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <WriteCta large />
          <Link to="/preise" className="font-semibold text-wald underline underline-offset-4 hover:text-rot">Preise ansehen</Link>
        </div>
        <div className="prose-bw mt-10">
          {landing.sections.map((s: Landing["sections"][number]) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              <p>{s.text}</p>
            </section>
          ))}
        </div>
        <div className="mt-10">
          <Faq items={landing.faq} title={`Fragen zu ${landing.h1.split(":")[0]}`} />
        </div>
        <nav className="mt-10 rounded-2xl border border-line bg-paper-2 p-6" aria-label="Weitere Themen">
          <p className="eyebrow">Weitere Themen</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {LANDINGS.filter((l) => l.slug !== landing.slug).map((l) => (
              <li key={l.slug}>
                <Link to="/$seite" params={{ seite: l.slug }} className="font-semibold text-wald hover:text-rot">{l.h1.split(":")[0]}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {posts.length > 0 && (
        <section className="mt-16" aria-labelledby="beispiele">
          <h2 id="beispiele" className="text-2xl">Aktuelle Beiträge im Blog Wien</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {posts.map((p: Post) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
