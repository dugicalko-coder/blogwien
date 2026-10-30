import { bindings } from "./bindings.server";
import { PRICE_CENTS, SITE_URL } from "./site";

type Env = { STRIPE_SECRET_KEY?: string; STRIPE_WEBHOOK_SECRET?: string };

export function stripeKey(): string | null {
  const k = (bindings() as unknown as Env).STRIPE_SECRET_KEY;
  return k && k.startsWith("sk_") ? k : null;
}

export function stripeWebhookSecret(): string | null {
  const k = (bindings() as unknown as Env).STRIPE_WEBHOOK_SECRET;
  return k && k.startsWith("whsec_") ? k : null;
}

export function stripeEnabled(): boolean {
  return stripeKey() !== null;
}

async function stripeRequest<T>(path: string, params?: Record<string, string>): Promise<T> {
  const key = stripeKey();
  if (!key) throw new Error("Stripe nicht konfiguriert");
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params ? new URLSearchParams(params).toString() : undefined,
  });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? `Stripe-Fehler ${res.status}`);
  return json;
}

export type CheckoutSession = {
  id: string;
  url: string | null;
  payment_status: string;
  status: string;
  client_reference_id: string | null;
  metadata?: Record<string, string>;
};

export async function createCheckoutSession(input: { orderId: string; title: string; email: string }): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>("/checkout/sessions", {
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(PRICE_CENTS),
    "line_items[0][price_data][product_data][name]": "Premium-Posting auf BlogWien.at",
    "line_items[0][price_data][product_data][description]": input.title.slice(0, 200),
    client_reference_id: input.orderId,
    "metadata[order_id]": input.orderId,
    customer_email: input.email,
    locale: "de",
    "invoice_creation[enabled]": "true",
    success_url: `${SITE_URL}/api/stripe/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/bezahlen/${input.orderId}`,
  });
}

export async function retrieveCheckoutSession(id: string): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>(`/checkout/sessions/${encodeURIComponent(id)}`);
}

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyStripeSignature(payload: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts: Record<string, string> = {};
  for (const p of header.split(",")) {
    const [k, v] = p.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  }
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 600) return false;
  const expected = await hmacHex(secret, `${t}.${payload}`);
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}
