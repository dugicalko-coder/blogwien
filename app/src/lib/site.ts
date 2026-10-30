// Zentrale Site-Konstanten (client- und serverseitig nutzbar, keine Secrets).
export const SITE_NAME = "BlogWien";
export const SITE_URL = "https://www.blogwien.at";
export const SITE_TAGLINE = "Blog Wien: Beiträge schreiben, veröffentlichen und auf Google gefunden werden";
export const PRICE_EUR = 99;
export const PRICE_CENTS = 9900;

export type Category = {
  slug: string;
  name: string;
  short: string;
  description: string;
  image: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "wien-leben",
    name: "Wien & Leben",
    short: "Wien",
    description: "Stadtleben, Kultur, Grätzl, Kaffeehäuser und Tipps aus Wien.",
    image: "/assets/wien-ring-oper.jpg",
  },
  {
    slug: "reisen-freizeit",
    name: "Reisen & Freizeit",
    short: "Reisen",
    description: "Ausflüge, Urlaub, Berge, Seen und Radwege in ganz Österreich.",
    image: "/assets/wien-schoenbrunn.jpg",
  },
  {
    slug: "bauen-wohnen",
    name: "Bauen & Wohnen",
    short: "Bauen",
    description: "Hausbau, Sanierung, Immobilien und Handwerk in Wien und Umgebung.",
    image: "/assets/wien-baustelle.jpg",
  },
  {
    slug: "energie-umwelt",
    name: "Energie & Umwelt",
    short: "Energie",
    description: "Photovoltaik, Wärmepumpe, Brunnen, Geothermie und Förderungen.",
    image: "/assets/wien-solar.jpg",
  },
  {
    slug: "essen-trinken",
    name: "Essen & Trinken",
    short: "Kulinarik",
    description: "Restaurants, Heurige, Kaffeehäuser und Wiener Küche.",
    image: "/assets/wien-naschmarkt.jpg",
  },
  {
    slug: "wirtschaft-marketing",
    name: "Wirtschaft & Marketing",
    short: "Business",
    description: "Unternehmen, Online-Marketing, SEO und Gastartikel in Wien.",
    image: "/assets/wien-kaffeehaus.jpg",
  },
];

export function categoryBySlug(slug: string): Category {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
}

// Keyword-Cluster fuer Footer, Landingpages und Meta-Texte.
export const KEYWORDS = [
  "Blog Wien",
  "Blogposting Wien",
  "Gastartikel Wien",
  "Blogbeitrag veröffentlichen Wien",
  "Backlink Wien",
  "SEO Wien",
  "Content Marketing Wien",
  "Pressemitteilung Wien",
  "Firmenblog Wien",
  "Blogartikel schreiben lassen",
  "Online sichtbar werden Wien",
  "Wiener Blog",
  "Blog Österreich",
  "Gastbeitrag Österreich",
  "Lokale Suchmaschinenoptimierung Wien",
  "Unternehmensblog Wien",
];

export type Landing = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  sections: { heading: string; text: string }[];
  faq: { q: string; a: string }[];
};

export const LANDINGS: Landing[] = [
  {
    slug: "blog-wien",
    title: "Blog Wien: Der offene Blog für Wien und Österreich",
    h1: "Blog Wien: Schreiben, veröffentlichen, gefunden werden",
    description:
      "Blog Wien ist die offene Blog-Plattform für Wien: Beiträge kostenlos schreiben, ab 99 Euro mit Backlink veröffentlichen und bei Google sichtbar werden.",
    intro:
      "BlogWien ist der Blog für Wien, in dem jede und jeder schreiben darf. Unternehmen, Vereine, Lokale und Privatpersonen veröffentlichen hier Beiträge über Wien und Österreich. Die Redaktion prüft jeden Text, damit die Qualität stimmt und Google die Seite als vertrauenswürdige Quelle einstuft.",
    sections: [
      {
        heading: "Warum ein Beitrag im Blog Wien Ihrem Unternehmen hilft",
        text: "Ein veröffentlichter Beitrag ist eine dauerhafte Seite im Internet, die Google indexiert. Wer nach Ihrem Thema in Wien sucht, findet Ihren Beitrag und damit Ihr Unternehmen. Mit dem Premium-Posting um 99 Euro bekommen Sie zusätzlich einen Backlink auf Ihre Website, der Ihre eigene Domain in den Suchergebnissen stärkt.",
      },
      {
        heading: "So funktioniert das Blogposting in Wien",
        text: "Sie schreiben Ihren Text direkt im Editor, laden optional ein Bild hoch und geben Ihre Website an. Danach entscheiden Sie: kostenlos einreichen (ohne Backlink, Freigabe nach Prüfung) oder um 99 Euro als Premium-Beitrag mit Backlink, Hervorhebung auf der Startseite und bevorzugter Freigabe.",
      },
      {
        heading: "Themen, die im Blog Wien gelesen werden",
        text: "Wien und Leben, Reisen und Freizeit, Bauen und Wohnen, Energie und Umwelt, Essen und Trinken sowie Wirtschaft und Marketing. Innerhalb dieser Kategorien ist fast jedes Thema mit Bezug zu Wien oder Österreich willkommen.",
      },
    ],
    faq: [
      { q: "Was kostet ein Beitrag im Blog Wien?", a: "Das Einreichen ist kostenlos. Ein Premium-Beitrag mit Backlink, Startseiten-Platzierung und schneller Freigabe kostet einmalig 99 Euro." },
      { q: "Wie lange bleibt mein Beitrag online?", a: "Veröffentlichte Beiträge bleiben dauerhaft online, solange sie unseren Richtlinien entsprechen." },
      { q: "Darf ich über mein eigenes Unternehmen schreiben?", a: "Ja. Wichtig ist ein informativer Text mit echtem Mehrwert für Leserinnen und Leser, keine reine Werbeanzeige." },
    ],
  },
  {
    slug: "blogposting-wien",
    title: "Blogposting Wien: Beitrag ab 99 Euro veröffentlichen",
    h1: "Blogposting Wien: Ihr Beitrag mit Backlink ab 99 Euro",
    description:
      "Blogposting Wien: Veröffentlichen Sie Ihren Blogbeitrag mit Backlink auf BlogWien.at. Einmalig 99 Euro, Freigabe durch die Redaktion, dauerhaft online.",
    intro:
      "Blogposting bedeutet: Sie veröffentlichen einen eigenen Beitrag auf einer fremden, thematisch passenden Website und gewinnen damit Reichweite, Vertrauen und einen Backlink. BlogWien ist dafür die Plattform in Wien, mit fairem Fixpreis und redaktioneller Prüfung.",
    sections: [
      {
        heading: "Was Sie für 99 Euro bekommen",
        text: "Einen dauerhaft veröffentlichten Beitrag mit bis zu zwei Links auf Ihre Website, Platzierung im Bereich Neueste Beiträge auf der Startseite, Aufnahme in die Kategorie-Seiten und in die Sitemap sowie eine Freigabe innerhalb von 24 Stunden an Werktagen.",
      },
      {
        heading: "Für wen sich Blogposting in Wien lohnt",
        text: "Handwerksbetriebe, Gastronomie, Immobilienprofis, Energieberater, Ärztinnen, Kanzleien, Online-Shops und Vereine. Überall dort, wo Menschen bei Google nach einer Lösung in Wien suchen, hilft ein gut geschriebener Beitrag.",
      },
      {
        heading: "Qualitätsrichtlinien",
        text: "Mindestens 300 Wörter, eigener Text, keine Kopien, keine irreführenden Aussagen, keine verbotenen Inhalte. Links müssen zum Thema passen. Die Redaktion darf Rechtschreibung und Formatierung anpassen.",
      },
    ],
    faq: [
      { q: "Wie schnell ist mein Beitrag online?", a: "Premium-Beiträge werden in der Regel innerhalb von 24 Stunden an Werktagen geprüft und freigeschaltet." },
      { q: "Bekomme ich eine Rechnung?", a: "Ja, nach der Zahlung erhalten Sie eine Rechnung per E-Mail an die angegebene Adresse." },
      { q: "Kann ich den Beitrag später ändern?", a: "Schreiben Sie uns mit dem Link zum Beitrag, wir aktualisieren Text oder Links für Sie." },
    ],
  },
  {
    slug: "gastartikel-wien",
    title: "Gastartikel Wien: Gastbeitrag veröffentlichen",
    h1: "Gastartikel in Wien veröffentlichen",
    description:
      "Gastartikel Wien: Schreiben Sie einen Gastbeitrag auf BlogWien.at und erreichen Sie Leserinnen und Leser aus Wien und Österreich. Kostenlos oder Premium ab 99 Euro.",
    intro:
      "Ein Gastartikel ist die klassische Form des Content-Marketings: Sie teilen Wissen, zeigen Kompetenz und verweisen auf Ihre Website. Auf BlogWien finden Gastartikel eine lokale Leserschaft, die genau nach Wiener Themen sucht.",
    sections: [
      { heading: "Welche Gastartikel wir veröffentlichen", text: "Ratgeber, Erfahrungsberichte, Interviews, Grätzl-Porträts, Anleitungen und Branchenwissen mit Bezug zu Wien oder Österreich. Reine Produktanzeigen lehnen wir ab, informative Texte mit dezentem Firmenbezug nehmen wir gerne." },
      { heading: "Aufbau eines guten Gastartikels", text: "Eine klare Überschrift mit dem Hauptkeyword, ein Einstieg, der das Problem benennt, drei bis fünf Zwischenüberschriften, konkrete Tipps und ein kurzer Absatz über die Autorin oder den Autor mit Link." },
      { heading: "Backlink und SEO-Wirkung", text: "Premium-Gastartikel enthalten einen normalen Link (dofollow) auf Ihre Website. Zusammen mit dem thematischen Umfeld auf BlogWien ist das ein sauberes, lokales Signal für Google." },
    ],
    faq: [
      { q: "Muss ich den Gastartikel selbst schreiben?", a: "Ja, der Text sollte von Ihnen stammen. Auf Wunsch vermitteln wir aber Texterinnen und Texter." },
      { q: "Gibt es eine Mindestlänge?", a: "300 Wörter sind das Minimum, 600 bis 900 Wörter ranken erfahrungsgemäß am besten." },
    ],
  },
  {
    slug: "backlink-wien",
    title: "Backlink Wien: Lokalen Backlink aus Wien bekommen",
    h1: "Backlink aus Wien für Ihre Website",
    description:
      "Backlink Wien: Mit einem Premium-Beitrag auf BlogWien.at erhalten Sie einen thematisch passenden, lokalen Backlink für 99 Euro. Fair, transparent, dauerhaft.",
    intro:
      "Backlinks bleiben einer der wichtigsten Rankingfaktoren. Ein Link von einer Wiener Blog-Plattform mit echten Inhalten ist für lokale Unternehmen besonders wertvoll, weil er Relevanz für den Standort Wien signalisiert.",
    sections: [
      { heading: "Warum lokale Backlinks zählen", text: "Google bewertet Links im Kontext. Ein Link aus einem Beitrag über Hausbau in Wien auf eine Wiener Baufirma ist thematisch und geografisch stimmig. Genau solche Links helfen bei Suchanfragen wie Baufirma Wien oder Hausbau Wien." },
      { heading: "So bekommen Sie den Backlink", text: "Beitrag schreiben, Website angeben, Premium-Posting um 99 Euro wählen. Nach der Freigabe ist der Link im Beitrag aktiv und bleibt dauerhaft bestehen." },
      { heading: "Was wir nicht machen", text: "Keine versteckten Links, keine Linkfarmen, keine Themen ohne Bezug zum Beitrag. Das schützt Ihre Domain und unsere Plattform." },
    ],
    faq: [
      { q: "Ist der Backlink dofollow?", a: "Ja, Premium-Beiträge enthalten normale dofollow-Links auf Ihre Website." },
      { q: "Wie viele Links darf ich setzen?", a: "Bis zu zwei Links auf Ihre eigene Domain pro Beitrag." },
    ],
  },
  {
    slug: "seo-wien",
    title: "SEO Wien: Sichtbarkeit bei Google für Wiener Unternehmen",
    h1: "SEO Wien: Mit Inhalten auf Google gefunden werden",
    description:
      "SEO Wien leicht gemacht: Mit Blogbeiträgen auf BlogWien.at gewinnen Wiener Unternehmen Sichtbarkeit, Backlinks und Kunden aus der Google-Suche.",
    intro:
      "Suchmaschinenoptimierung in Wien heißt vor allem: relevante Inhalte, lokale Signale und vertrauenswürdige Links. BlogWien bietet alle drei Bausteine in einem Beitrag.",
    sections: [
      { heading: "Lokale Suchanfragen verstehen", text: "Menschen suchen konkret: Kran mieten Wien, Wärmepumpe Wien Kosten, Sushi Wien Mitte. Ein Beitrag, der diese Frage beantwortet, hat gute Chancen auf ein Ranking, besonders in einem Umfeld, das Google bereits als Wiener Themenseite kennt." },
      { heading: "Content, der rankt", text: "Beantworten Sie die Frage im ersten Absatz, nutzen Sie Zwischenüberschriften, nennen Sie Bezirke und Orte, geben Sie Richtwerte und schreiben Sie so, wie Sie einem Kunden am Telefon erklären würden." },
      { heading: "Backlinks und Erwähnungen", text: "Jeder Premium-Beitrag verlinkt auf Ihre Website. Zusätzlich taucht Ihr Firmenname im Autorenbereich auf, was als Erwähnung ebenfalls zählt." },
    ],
    faq: [
      { q: "Ersetzt BlogWien eine SEO-Agentur?", a: "Nein, aber es ist ein günstiger, sofort umsetzbarer Baustein, der jede SEO-Strategie ergänzt." },
      { q: "Wann sehe ich Ergebnisse?", a: "Beiträge werden meist innerhalb weniger Tage indexiert. Rankings entwickeln sich über Wochen." },
    ],
  },
  {
    slug: "blogbeitrag-schreiben-lassen",
    title: "Blogbeitrag schreiben lassen in Wien",
    h1: "Blogbeitrag schreiben lassen und auf BlogWien veröffentlichen",
    description:
      "Keine Zeit zum Schreiben? Lassen Sie Ihren Blogbeitrag von Wiener Texterinnen und Textern schreiben und auf BlogWien.at mit Backlink veröffentlichen.",
    intro:
      "Nicht jedes Unternehmen hat Zeit für eigene Texte. Über BlogWien vermitteln wir erfahrene Texterinnen und Texter aus Wien, die Ihren Beitrag recherchieren, schreiben und für Google optimieren.",
    sections: [
      { heading: "Ablauf", text: "Sie schicken uns Thema, Website und drei Stichpunkte. Wir melden uns mit einem Fixpreis und einem Liefertermin. Nach Ihrer Freigabe veröffentlichen wir den Beitrag als Premium-Posting inklusive Backlink." },
      { heading: "Was ein guter Auftragstext braucht", text: "Ein klares Ziel (welche Suchanfrage soll der Text beantworten), Ihre Kernbotschaft und Ihre Kontaktdaten. Den Rest übernehmen die Profis." },
    ],
    faq: [
      { q: "Was kostet ein geschriebener Beitrag?", a: "Der Preis hängt von Länge und Recherche ab. Sie erhalten vorab ein Fixangebot, das Premium-Posting um 99 Euro ist darin enthalten." },
    ],
  },
  {
    slug: "pressemitteilung-wien",
    title: "Pressemitteilung Wien veröffentlichen",
    h1: "Pressemitteilung in Wien online veröffentlichen",
    description:
      "Pressemitteilung Wien: Veröffentlichen Sie Ihre Presseinformation auf BlogWien.at, dauerhaft indexiert, mit Link zu Ihrem Unternehmen. Ab 99 Euro.",
    intro:
      "Eröffnung, Jubiläum, neues Produkt, Auszeichnung: Eine Pressemitteilung auf BlogWien ist die einfachste Möglichkeit, eine Nachricht aus Wien dauerhaft online und auffindbar zu machen.",
    sections: [
      { heading: "Aufbau einer Pressemitteilung", text: "Schlagzeile, Ort und Datum, ein Kernabsatz mit den wichtigsten Fakten, Hintergrund, ein Zitat und ein Absatz über das Unternehmen mit Kontakt und Link." },
      { heading: "Vorteile gegenüber Social Media", text: "Ein Beitrag auf BlogWien bleibt online und wird von Google indexiert. Ein Social-Media-Post ist nach zwei Tagen verschwunden." },
    ],
    faq: [
      { q: "Wird meine Pressemitteilung als News markiert?", a: "Ja, die Redaktion kann Beiträge als Wien-News kennzeichnen. Diese erscheinen zusätzlich im News-Bereich der Startseite." },
    ],
  },
  {
    slug: "firmenblog-wien",
    title: "Firmenblog Wien: Ohne eigene Technik bloggen",
    h1: "Firmenblog für Wiener Unternehmen, ohne Technikaufwand",
    description:
      "Firmenblog Wien: Nutzen Sie BlogWien.at als Blog für Ihr Unternehmen. Regelmäßig Beiträge veröffentlichen, Kunden informieren, Google-Sichtbarkeit aufbauen.",
    intro:
      "Viele Wiener Unternehmen haben eine Website, aber keinen Blog. BlogWien ist die Abkürzung: Sie schreiben, wir hosten, prüfen und verbreiten. Jeder Beitrag verlinkt zurück auf Ihre Seite.",
    sections: [
      { heading: "Regelmäßig statt einmalig", text: "Ein Beitrag pro Monat reicht, um bei Google als aktive Marke wahrgenommen zu werden. Mit jedem Beitrag wächst die Zahl der Seiten, die auf Ihr Unternehmen verweisen." },
      { heading: "Themenideen für Ihren Firmenblog", text: "Häufige Kundenfragen, Blick hinter die Kulissen, Saisonthemen (Heizung im Herbst, Garten im Frühling), Projekte und Referenzen, Mitarbeiterporträts." },
    ],
    faq: [
      { q: "Gibt es Mengenrabatt?", a: "Ja, ab fünf Premium-Beiträgen im Jahr. Schreiben Sie uns über das Kontaktformular im Impressum." },
    ],
  },
];

export function landingBySlug(slug: string): Landing | undefined {
  return LANDINGS.find((l) => l.slug === slug);
}

export const HOME_FAQ = [
  { q: "Was ist BlogWien?", a: "BlogWien ist eine offene Blog-Plattform für Wien und Österreich. Jede Person und jedes Unternehmen kann Beiträge schreiben, die Redaktion prüft sie, dann werden sie veröffentlicht und von Google indexiert." },
  { q: "Kostet das Schreiben etwas?", a: "Nein. Schreiben und Einreichen ist kostenlos. Erst wenn Sie mehr Reichweite, einen Backlink und eine schnelle Freigabe wollen, wählen Sie das Premium-Posting um 99 Euro." },
  { q: "Was bringt der Backlink?", a: "Ein Link von BlogWien auf Ihre Website ist ein Vertrauenssignal für Google. Ihre Seite wird für Suchanfragen aus Wien besser gefunden." },
  { q: "Wie lange dauert die Freigabe?", a: "Premium-Beiträge innerhalb von 24 Stunden an Werktagen, kostenlose Beiträge je nach Aufkommen innerhalb von etwa einer Woche." },
  { q: "Welche Inhalte sind erlaubt?", a: "Informative Beiträge mit Bezug zu Wien oder Österreich. Keine Kopien, keine irreführenden Aussagen, keine verbotenen Inhalte, keine reine Werbung." },
  { q: "Kann ich mehrere Beiträge veröffentlichen?", a: "Ja, so viele Sie möchten. Für regelmäßige Veröffentlichungen gibt es Mengenrabatt." },
  { q: "Wie bezahle ich?", a: "Sicher online per Karte. Sie erhalten nach der Zahlung eine Rechnung per E-Mail." },
  { q: "Wer steht hinter BlogWien?", a: "BlogWien wird von Digital Denker in Wien betrieben, einem Team für lokale Online-Sichtbarkeit." },
];

export type Impressum = {
  company: string;
  legalForm: string;
  owner: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  uid: string;
  fn: string;
  court: string;
  authority: string;
  mapQuery: string;
};

export const DEFAULT_IMPRESSUM: Impressum = {
  company: "Digital Denker",
  legalForm: "e.U.",
  owner: "",
  street: "Wattgasse 33",
  zip: "1160",
  city: "Wien",
  country: "Österreich",
  phone: "",
  email: "office@blogwien.at",
  uid: "",
  fn: "",
  court: "Handelsgericht Wien",
  authority: "Magistrat der Stadt Wien",
  mapQuery: "Wattgasse 33, 1160 Wien, Österreich",
};

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("de-AT", { day: "2-digit", month: "long", year: "numeric" });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export type Partner = { name: string; url: string; tag: string };
export const PARTNERS: Partner[] = [
  { name: "Konzessionsuche.at", url: "https://konzessionsuche.at", tag: "Gewerbe und Konzession" },
  { name: "SolarWien", url: "https://solarwien.at", tag: "Photovoltaik" },
  { name: "Alpenkraft Projekt Bau", url: "https://alpenkraft-bau.at", tag: "Bauunternehmen" },
  { name: "Heizexperten", url: "https://heizexperten.at", tag: "Wärmepumpen" },
  { name: "Bestbieter", url: "https://bestbieter.at", tag: "Ausschreibungen" },
  { name: "JaPergola", url: "https://japergola.at", tag: "Pergolen und Terrassen" },
  { name: "Fassadenfirma.at", url: "https://fassadenfirma.at", tag: "Fassadensanierung" },
  { name: "Wienerinfo.at", url: "https://wienerinfo.at", tag: "Wien-Nachrichten" },
  { name: "Hausbauwien", url: "https://hausbauwien.at", tag: "Hausbau" },
  { name: "Abbruchabriss", url: "https://abbruchabriss.at", tag: "Abbruch und Abriss" },
];
