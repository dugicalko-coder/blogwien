import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../lib/bindings.server";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX = 6 * 1024 * 1024;

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const storage = bindings().STORAGE;
        if (!storage) return Response.json({ ok: false, error: "Bild-Speicher nicht verfügbar" }, { status: 503 });
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ ok: false, error: "Ungültige Anfrage" }, { status: 400 });
        }
        const file = form.get("file");
        if (!(file instanceof File)) return Response.json({ ok: false, error: "Keine Datei" }, { status: 400 });
        const ext = TYPES[file.type];
        if (!ext) return Response.json({ ok: false, error: "Nur JPG, PNG oder WebP" }, { status: 400 });
        if (file.size > MAX) return Response.json({ ok: false, error: "Maximal 6 MB" }, { status: 400 });
        const key = `${crypto.randomUUID()}.${ext}`;
        await storage.put(`img/${key}`, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
        return Response.json({ ok: true, url: `/bild/${key}` }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
