import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getOrderWithPost } from "../../../lib/db.server";
import { createCheckoutSession, stripeEnabled } from "../../../lib/stripe.server";

export const Route = createFileRoute("/api/stripe/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!stripeEnabled()) return Response.json({ ok: false, error: "Online-Zahlung ist derzeit nicht verfügbar" }, { status: 503 });
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Ungültige Anfrage" }, { status: 400 });
        }
        const parsed = z.object({ orderId: z.string().uuid() }).safeParse(body);
        if (!parsed.success) return Response.json({ ok: false, error: "Ungültige Bestellung" }, { status: 400 });
        const res = await getOrderWithPost(parsed.data.orderId);
        if (!res) return Response.json({ ok: false, error: "Bestellung nicht gefunden" }, { status: 404 });
        if (res.order.status === "paid") return Response.json({ ok: true, paid: true });
        try {
          const session = await createCheckoutSession({ orderId: res.order.id, title: res.post.title, email: res.order.customer_email });
          if (!session.url) throw new Error("Keine Checkout-URL erhalten");
          return Response.json({ ok: true, url: session.url });
        } catch (e) {
          console.error(e);
          return Response.json({ ok: false, error: "Zahlung konnte nicht gestartet werden" }, { status: 502 });
        }
      },
    },
  },
});
