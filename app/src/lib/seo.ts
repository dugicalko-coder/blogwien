import { SITE_NAME, SITE_URL } from "./site";

export function pageHead(opts: { title: string; description: string; path: string; image?: string; noindex?: boolean; type?: string }) {
  const url = `${SITE_URL}${opts.path === "/" ? "" : opts.path}`;
  const image = opts.image ?? `${SITE_URL}/assets/og.png`;
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { name: "robots", content: opts.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large" },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:url", content: url },
      { property: "og:type", content: opts.type ?? "website" },
      { property: "og:image", content: image },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "de_AT" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: opts.title },
      { name: "twitter:description", content: opts.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export const ORG_ID = `${SITE_URL}/#org`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function orgGraph() {
  return [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/assets/logo.png`,
      description: "Offene Blog-Plattform für Wien und Österreich: Beiträge schreiben, veröffentlichen und bei Google gefunden werden.",
      address: { "@type": "PostalAddress", addressLocality: "Wien", addressCountry: "AT" },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "de-AT",
      publisher: { "@id": ORG_ID },
    },
  ];
}

export function jsonLd(graph: unknown[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}
