import { createFileRoute } from "@tanstack/react-router";
import { markOrderPaid } from "../../../lib/db.server";
import { stripeWebhookSecret, verifyStripeSignature } from "../../../lib/stripe.server";

type StripeEvent = { type?: string; data?: { object?: { payment_status?: string; metadata?: Record<string, string>; client_reference_id?: string | null } } };

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = stripeWebhookSecret();
        if (!secret) return new Response("webhook not configured", { status: 503 });
        const payload = await request.text();
        const ok = await verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret);
        if (!ok) return new Response("invalid signature", { status: 400 });
        let event: StripeEvent;
        try {
          event = JSON.parse(payload) as StripeEvent;
        } catch {
          return new Response("bad json", { status: 400 });
        }
        if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
          const o = event.data?.object;
          const orderId = o?.metadata?.order_id ?? o?.client_reference_id ?? "";
          if (orderId && o?.payment_status === "paid") await markOrderPaid(orderId, "stripe");
        }
        return Response.json({ received: true });
      },
    },
  },
});
