export type FaqItem = { q: string; a: string };

export function Faq({ items, title = "Häufige Fragen" }: { items: FaqItem[]; title?: string }) {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-3xl">{title}</h2>
      <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
        {items.map((it, i) => (
          <details key={i} className="group px-5 py-4" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
              {it.q}
              <span aria-hidden className="text-rot transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-ink-2">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
