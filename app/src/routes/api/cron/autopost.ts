import { createFileRoute } from "@tanstack/react-router";
import { runAutopost } from "../../../lib/autopost.server";

// Vom Vercel-Cron 3x taeglich aufgerufen. Vercel sendet "Authorization: Bearer <CRON_SECRET>".
export const Route = createFileRoute("/api/cron/autopost")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
          return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        }
        const slotParam = new URL(request.url).searchParams.get("slot");
        const slot = slotParam !== null && /^[0-2]$/.test(slotParam) ? Number(slotParam) : undefined;
        try {
          const result = await runAutopost(slot);
          console.log("autopost", JSON.stringify(result));
          return Response.json(result, { status: result.ok ? 200 : 409, headers: { "Cache-Control": "no-store" } });
        } catch (e) {
          console.error("autopost failed", e);
          return Response.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
        }
      },
    },
  },
});
