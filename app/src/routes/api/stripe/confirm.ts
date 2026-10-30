import { createFileRoute } from "@tanstack/react-router";
import { markOrderPaid } from "../../../lib/db.server";
import { retrieveCheckoutSession, stripeEnabled } from "../../../lib/stripe.server";

export const Route = createFileRoute("/api/stripe/confirm")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sid = new URL(request.url).searchParams.get("session_id") ?? "";
        if (!sid || !stripeEnabled()) return Response.redirect(new URL("/", request.url).toString(), 302);
        try {
          const s = await retrieveCheckoutSession(sid);
          const orderId = s.metadata?.order_id ?? s.client_reference_id ?? "";
          if (orderId && s.payment_status === "paid") await markOrderPaid(orderId, "stripe");
          return Response.redirect(new URL(orderId ? `/bezahlen/${orderId}` : "/", request.url).toString(), 302);
        } catch (e) {
          console.error(e);
          return Response.redirect(new URL("/", request.url).toString(), 302);
        }
      },
    },
  },
});
