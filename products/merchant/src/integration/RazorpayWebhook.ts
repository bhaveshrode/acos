import crypto from "node:crypto";

export const RAZORPAY_PAID_EVENT = "payment_link.paid";
export const RAZORPAY_REFUND_PROCESSED_EVENT = "refund.processed";
export const RAZORPAY_REFUND_FAILED_EVENT = "refund.failed";

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
  type: "payment";
  handled: boolean;
  gatewayReference?: string;
  gatewayPaymentId?: string;
  success?: boolean;
}

export interface NormalizedRefundWebhook {
  type: "refund";
  handled: true;
  /** Internal ids echoed back from the notes sent with the refund request. */
  paymentId?: string;
  refundRequestId?: string;
  gatewayRefundReference: string;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export type NormalizedRazorpayWebhook = NormalizedPaymentWebhook | NormalizedRefundWebhook;

/**
 * Reduces a Razorpay webhook body to the fields the payment boundary needs.
 * Only `payment_link.paid` is a terminal payment outcome: a declined card
 * attempt does not fail the link, the payer can retry it, and an expired or
 * cancelled link simply means no money moved. Refund events are matched to
 * the internal refund request through the notes echoed back from the
 * create-refund call; everything else is acknowledged so Razorpay stops
 * retrying without touching the ledger.
 */
export function normalizeRazorpayEvent(payload: any): NormalizedRazorpayWebhook {
  if (!payload || typeof payload !== "object" || typeof payload.event !== "string") {
    return { type: "payment", handled: false };
  }

  if (payload.event === RAZORPAY_REFUND_PROCESSED_EVENT || payload.event === RAZORPAY_REFUND_FAILED_EVENT) {
    return normalizeRefundEvent(payload, payload.event === RAZORPAY_REFUND_PROCESSED_EVENT);
  }

  if (payload.event !== RAZORPAY_PAID_EVENT) {
    return { type: "payment", handled: false };
  }

  const linkId = payload.payload?.payment_link?.entity?.id;
  const paymentId = payload.payload?.payment?.entity?.id;
  if (typeof linkId !== "string" || typeof paymentId !== "string") {
    return { type: "payment", handled: false };
  }

  return {
    type: "payment",
    handled: true,
    gatewayReference: linkId,
    gatewayPaymentId: paymentId,
    success: true
  };
}

function normalizeRefundEvent(payload: any, success: boolean): NormalizedRefundWebhook {
  const entity = payload.payload?.refund?.entity;
  if (!entity || typeof entity.id !== "string") {
    // A refund event without an entity cannot be reconciled; acknowledge so
    // Razorpay stops retrying rather than failing forever.
    return {
      type: "refund",
      handled: true,
      paymentId: undefined,
      refundRequestId: undefined,
      gatewayRefundReference: "",
      success,
      errorCode: "MALFORMED_PAYLOAD",
      errorMessage: "Razorpay refund event carried no refund entity."
    };
  }

  const notes = entity.notes ?? {};
  return {
    type: "refund",
    handled: true,
    paymentId: typeof notes.paymentId === "string" ? notes.paymentId : undefined,
    refundRequestId: typeof notes.refundRequestId === "string" && notes.refundRequestId !== "" ? notes.refundRequestId : undefined,
    gatewayRefundReference: entity.id,
    success,
    errorCode: success ? undefined : (entity.error_code ?? "REFUND_DECLINED"),
    errorMessage: success ? undefined : (entity.error_description ?? "Refund declined by gateway")
  };
}
