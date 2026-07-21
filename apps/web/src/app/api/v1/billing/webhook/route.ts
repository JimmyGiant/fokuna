import { jsonOk } from "@/server/http";

export const dynamic = "force-dynamic";

/** Stripe webhook stub — signature verification lands with live Stripe keys. */
export async function POST(request: Request) {
  const payload = await request.text();
  console.info("[stripe-webhook]", { bytes: payload.length });
  return jsonOk({ received: true });
}
