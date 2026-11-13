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

export interface IPaymentProvider {
  getName(): string;
  initiatePayment(paymentId: string, amount: number, currency: string): Promise<PaymentResponse>;
  completePayment(input: PaymentCompletion): Promise<PaymentResponse>;
}
