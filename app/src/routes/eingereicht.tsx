import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { pageHead } from "../lib/seo";

export const Route = createFileRoute("/eingereicht")({
  validateSearch: z.object({ slug: z.string().optional() }),
  head: () => pageHead({ title: "Beitrag eingereicht | BlogWien", description: "Ihr Beitrag wurde eingereicht und wird von der Redaktion geprüft.", path: "/eingereicht", noindex: true }),
  component: Page,
});

function Page() {
  return (
    <div className="container-bw py-20">
      <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-10 text-center">
        <span aria-hidden className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-wald-soft text-2xl text-wald">✓</span>
        <h1 className="mt-5 text-3xl">Danke, Ihr Beitrag ist eingereicht</h1>
        <p className="mt-3 text-ink-2">
          Die Redaktion prüft den Text und schaltet ihn frei. Sie bekommen eine E-Mail, sobald er online ist. Kostenlose Beiträge
          werden je nach Aufkommen innerhalb von etwa einer Woche geprüft.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/blog" className="rounded-full bg-ink px-5 py-3 font-semibold text-white hover:bg-rot">Beiträge lesen</Link>
          <Link to="/schreiben" className="rounded-full border-2 border-ink px-5 py-3 font-semibold hover:bg-ink hover:text-white">Noch einen schreiben</Link>
        </div>
      </div>
    </div>
  );
}
