import type { PaymentMethodType } from "acos-backend";

export interface PaymentResponse {
  gatewayReference: string;
  status: "PROCESSING" | "SUCCEEDED" | "FAILED";
  transactionHash?: string;
  errorCode?: string;
  errorMessage?: string;
  /**
   * Hosted checkout URL for gateways that collect on their own page.
   */
  paymentUrl?: string;
}

/**
 * Input for settling a payment from a gateway callback. `gatewayReference` is the
 * reference stored on the aggregate; `gatewayPaymentId` is the gateway's own
 * payment identifier when the callback carries one, so the provider can verify
 * the outcome against the gateway instead of trusting the received payload.
 */
export interface PaymentCompletion {
  gatewayReference: string;
  success: boolean;
  gatewayPaymentId?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Input for returning money on a confirmed payment. `paymentId` is the
 * internal aggregate id; `gatewayPaymentId` is the gateway's own payment
 * identifier when one was captured during collection; `refundRequestId` is
 * the internal refund request id, echoed back by gateways that round-trip
 * notes (e.g. Razorpay) so asynchronous refund webhooks can be matched to
 * the request that created them.
 */
export interface RefundRequestInput {
  paymentId: string;
  gatewayPaymentId?: string;
  refundRequestId?: string;
  amount: number;
  currency: string;
  reason: string;
}

export interface RefundResponse {
  gatewayRefundReference: string;
  status: "PROCESSING" | "SUCCEEDED" | "FAILED";
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Thrown by a provider when the gateway may or may not have accepted a refund
 * (transport failure, server error, malformed success response). Callers must
 * keep the refund reservation pending — releasing it could let a retry create
 * a second gateway refund — and let the refund webhook or manual
 * reconciliation resolve the outcome.
 */
export class RefundOutcomeUnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RefundOutcomeUnknownError";
  }
}

export interface IPaymentProvider {
  getName(): string;
  /**
   * Method recorded on every payment this provider collects, so history and
   * callbacks attribute the money to the gateway that actually took it.
   */
  getMethodType(): PaymentMethodType;
  initiatePayment(paymentId: string, amount: number, currency: string): Promise<PaymentResponse>;
  completePayment(input: PaymentCompletion): Promise<PaymentResponse>;
  refundPayment(input: RefundRequestInput): Promise<RefundResponse>;
}
