import { SITE_URL } from "../lib/site";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const origin = SITE_URL;
        const body = ["User-agent: OAI-SearchBot", "Allow: /", "", "User-agent: *","Allow: /", "Disallow: /admin", "Disallow: /api/", "Disallow: /bezahlen/", "", `Sitemap: ${origin}/sitemap.xml`].join("\n");
        return new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
        });
      },
    },
  },
});
