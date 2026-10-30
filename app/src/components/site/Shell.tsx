import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { CATEGORIES, KEYWORDS, LANDINGS, PARTNERS, SITE_NAME } from "../../lib/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="BlogWien Startseite">
      <img src="/assets/logo.png" alt="BlogWien Logo" width={36} height={36} className="h-9 w-9 rounded-lg" />
      <span className="font-display text-2xl font-semibold tracking-tight">
        Blog<span className="text-rot">Wien</span>
      </span>
    </Link>
  );
}

const NAV = [
  { to: "/blog", label: "Beiträge" },
  { to: "/blog-wien", label: "Blog Wien" },
  { to: "/preise", label: "Preise" },
  { to: "/faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="container-bw flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex" aria-label="Hauptnavigation">
          {NAV.map((n) => (
            <a key={n.to} href={n.to} className="text-sm font-medium text-ink-2 hover:text-rot">
              {n.label}
            </a>
          ))}
          <WriteCta />
        </nav>
        <button
          type="button"
          className="rounded-lg border border-line px-3 py-2 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menü
        </button>
      </div>
      {open && (
        <div id="mobile-nav" className="border-t border-line bg-paper md:hidden">
          <div className="container-bw flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <a key={n.to} href={n.to} className="rounded-lg px-3 py-2 text-base font-medium hover:bg-paper-2" onClick={() => setOpen(false)}>
                {n.label}
              </a>
            ))}
            <Link to="/schreiben" className="mt-2 rounded-full bg-rot px-5 py-3 text-center font-semibold text-white" onClick={() => setOpen(false)}>
              Beitrag schreiben
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// CTA "Beitrag schreiben": eigene Interaktions-Identitaet (Feder + Hebung)
export function WriteCta({ large = false }: { large?: boolean }) {
  return (
    <Link
      to="/schreiben"
      className={`group inline-flex items-center gap-2 rounded-full bg-rot font-semibold text-white shadow-[0_6px_0_0_#9a1730] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_0_#9a1730] active:translate-y-0.5 active:shadow-[0_2px_0_0_#9a1730] ${large ? "px-7 py-4 text-lg" : "px-5 py-2.5 text-sm"}`}
    >
      <PenIcon className={large ? "h-5 w-5" : "h-4 w-4"} />
      Beitrag schreiben
    </Link>
  );
}

// CTA "Alle Beitraege": Textlink mit gleitendem Pfeil
export function ArrowLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={to} className="group inline-flex items-center gap-2 font-semibold text-wald hover:text-rot">
      {children}
      <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
    </a>
  );
}

export function PenIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-ink text-paper">
      <div className="container-bw grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="font-display text-2xl font-semibold">
            Blog<span className="text-gold">Wien</span>
          </div>
          <p className="mt-3 text-sm text-paper/70">
            Die offene Blog-Plattform für Wien und Österreich. Schreiben, veröffentlichen, gefunden werden.
          </p>
          <p className="mt-4 text-xs text-paper/50">Betrieben von Digital Denker e.U., Wattgasse 33, 1160 Wien. Mit KI erstellte Beiträge sind als „KI-generiert“ gekennzeichnet.</p>
        </div>
        <div>
          <h2 className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold">Kategorien</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to="/kategorie/$slug" params={{ slug: c.slug }} className="text-paper/80 hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold">Themen</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LANDINGS.map((l) => (
              <li key={l.slug}>
                <Link to="/$seite" params={{ seite: l.slug }} className="text-paper/80 hover:text-white">
                  {l.h1.split(":")[0]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold">{SITE_NAME}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/schreiben" className="text-paper/80 hover:text-white">Beitrag schreiben</Link></li>
            <li><Link to="/preise" className="text-paper/80 hover:text-white">Preise</Link></li>
            <li><Link to="/faq" className="text-paper/80 hover:text-white">Häufige Fragen</Link></li>
            <li><Link to="/impressum" className="text-paper/80 hover:text-white">Impressum und Kontakt</Link></li>
            <li><Link to="/datenschutz" className="text-paper/80 hover:text-white">Datenschutz</Link></li>
            <li><Link to="/agb" className="text-paper/80 hover:text-white">AGB</Link></li>
            <li><Link to="/admin" className="text-paper/50 hover:text-white">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-bw pt-8">
          <h2 className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold">Unsere Unternehmen</h2>
          <p className="mt-2 text-sm text-paper/60">Die Firmengruppe hinter BlogWien. Ein Klick führt direkt zur jeweiligen Website.</p>
        </div>
        <div className="bw-marquee mt-5 pb-8" aria-label="Unsere Unternehmen">
          <div className="bw-marquee-track">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <a
                key={`${p.url}-${i}`}
                href={p.url}
                target="_blank"
                rel="noopener"
                aria-hidden={i >= PARTNERS.length ? true : undefined}
                tabIndex={i >= PARTNERS.length ? -1 : undefined}
                className="group mx-3 inline-flex shrink-0 items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 transition hover:border-gold hover:bg-white/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-display text-sm font-semibold text-ink">{p.name.charAt(0)}</span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-white">{p.name}</span>
                  <span className="text-xs text-paper/60">{p.tag}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-bw py-8">
          <h2 className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold">Gesucht in Wien</h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-paper/60">
            {KEYWORDS.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-paper/40">© {new Date().getFullYear()} BlogWien · Digital Denker e.U. · Wattgasse 33, 1160 Wien</p>
        </div>
      </div>
    </footer>
  );
}
