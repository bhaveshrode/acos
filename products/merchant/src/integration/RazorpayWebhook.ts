import crypto from "node:crypto";

export const RAZORPAY_PAID_EVENT = "payment_link.paid";

/**
 * Razorpay signs the exact request body bytes with HMAC-SHA256 and sends the
 * lowercase hex digest in `X-Razorpay-Signature`. There is no timestamp in the
 * header, so replay protection relies on payment-level idempotency rather than
 * on a signature freshness window.
 */
export function verifyRazorpaySignature(
  rawBody: string | Buffer | undefined,
  signature: string | undefined,
  secret: string | null | undefined
): boolean {
  if (!rawBody || !signature || !secret) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signature.trim().toLowerCase();
  if (provided.length !== expected.length || !/^[0-9a-f]+$/.test(provided)) return false;

  return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(provided, "utf8"));
}

export interface NormalizedPaymentWebhook {
  handled: boolean;
  gatewayReference?: string;
  gatewayPaymentId?: string;
  success?: boolean;
}

/**
 * Reduces a Razorpay webhook body to the fields the payment boundary needs.
 * Only `payment_link.paid` is a terminal outcome: a declined card attempt does
 * not fail the link, the payer can retry it, and an expired or cancelled link
 * simply means no money moved. Those events are acknowledged and ignored.
 */
export function normalizeRazorpayEvent(payload: any): NormalizedPaymentWebhook {
  if (!payload || typeof payload !== "object" || typeof payload.event !== "string") {
    return { handled: false };
  }

  if (payload.event !== RAZORPAY_PAID_EVENT) {
    return { handled: false };
  }

  const linkId = payload.payload?.payment_link?.entity?.id;
  const paymentId = payload.payload?.payment?.entity?.id;
  if (typeof linkId !== "string" || typeof paymentId !== "string") {
    return { handled: false };
  }

  return {
    handled: true,
    gatewayReference: linkId,
    gatewayPaymentId: paymentId,
    success: true
  };
}
