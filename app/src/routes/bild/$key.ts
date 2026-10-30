import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../lib/bindings.server";

export const Route = createFileRoute("/bild/$key")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params.key;
        if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(key)) return new Response("Not found", { status: 404 });
        const storage = bindings().STORAGE;
        if (!storage) return new Response("Not found", { status: 404 });
        const obj = await storage.get(`img/${key}`);
        if (!obj) return new Response("Not found", { status: 404 });
        return new Response(obj.body as unknown as BodyInit, {
          headers: {
            "Content-Type": obj.httpMetadata?.contentType ?? "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            ETag: obj.httpEtag,
          },
        });
      },
    },
  },
});
