import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getOrderWithPost, markOrderPaid } from "../../lib/db.server";
import { stripeEnabled } from "../../lib/stripe.server";

// Demo-Zahlung: markiert die Bestellung als bezahlt und schaltet den Beitrag
// in die Redaktionsfreigabe. Wird spaeter durch den Stripe-Webhook ersetzt.
export const Route = createFileRoute("/api/pay")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("order") ?? "";
        const res = await getOrderWithPost(id);
        if (!res) return Response.json({ ok: false, error: "Bestellung nicht gefunden" }, { status: 404 });
        return Response.json({
          ok: true,
          stripe: stripeEnabled(),
          order: { id: res.order.id, status: res.order.status, amount_cents: res.order.amount_cents, email: res.order.customer_email },
          post: { title: res.post.title, slug: res.post.slug, status: res.post.status, website_url: res.post.website_url },
        });
      },
      POST: async ({ request }) => {
        if (stripeEnabled()) return Response.json({ ok: false, error: "Bitte über die sichere Online-Zahlung bezahlen" }, { status: 400 });
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Ungültige Anfrage" }, { status: 400 });
        }
        const parsed = z.object({ orderId: z.string().uuid(), method: z.string().max(40).default("demo") }).safeParse(body);
        if (!parsed.success) return Response.json({ ok: false, error: "Ungültige Bestellung" }, { status: 400 });
        const ok = await markOrderPaid(parsed.data.orderId, `demo:${parsed.data.method}`);
        if (!ok) return Response.json({ ok: false, error: "Bestellung nicht gefunden" }, { status: 404 });
        return Response.json({ ok: true });
      },
    },
  },
});
