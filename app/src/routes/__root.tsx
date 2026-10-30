import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
import appMetaJson from "../app-meta.json";
import { Footer, Header } from "../components/site/Shell";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "../lib/site";

declare const __HF_DESIGN_INSPECTOR__: boolean;

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? `${SITE_NAME}: ${SITE_TAGLINE}`;
  const description =
    meta.og_description ??
    "BlogWien ist die offene Blog-Plattform für Wien: Beiträge kostenlos schreiben, ab 99 Euro mit Backlink veröffentlichen und bei Google gefunden werden.";
  const ogImage = meta.og_image_url ?? `${SITE_URL}/assets/og.png`;
  const favicon = meta.favicon_url ?? "/assets/favicon.png";
  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: "BlogWien / Digital Denker" },
      { name: "theme-color", content: "#c41e3a" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "de_AT" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: ogImage },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: favicon },
      { rel: "apple-touch-icon", href: "/assets/logo.png" },
    ],
  };
}

function NotFoundComponent() {
  return (
    <div className="container-bw py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl">Diese Seite gibt es nicht</h1>
      <p className="mt-4 text-ink-2">Der Beitrag wurde vielleicht verschoben oder der Link ist unvollständig.</p>
      <a href="/" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-rot">
        Zur Startseite
      </a>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="container-bw py-24 text-center">
      <h1 className="text-3xl">Da ist etwas schiefgelaufen</h1>
      <p className="mt-3 text-ink-2">Bitte laden Sie die Seite neu oder versuchen Sie es später noch einmal.</p>
      <button type="button" onClick={reset} className="mt-8 rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-rot">
        Nochmal versuchen
      </button>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="de-AT">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) return;
    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => {
        installHiggsfieldDesignInspector();
      })
      .catch((error) => {
        reportHiggsfieldError(error instanceof Error ? error : new Error("Failed to load design inspector"), {
          boundary: "higgsfield_design_inspector_import",
        });
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <a href="#inhalt" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Zum Inhalt springen
      </a>
      <Header />
      <main id="inhalt">
        <Outlet />
      </main>
      <Footer />
    </QueryClientProvider>
  );
}
