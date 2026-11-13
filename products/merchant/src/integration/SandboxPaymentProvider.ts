export interface PaymentResponse {
  gatewayReference: string;
  status: "PROCESSING" | "SUCCEEDED" | "FAILED";
  transactionHash?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface IPaymentProvider {
  getName(): string;
  initiatePayment(paymentId: string, amount: number, currency: string): Promise<PaymentResponse>;
  completePayment(gatewayReference: string, success: boolean): Promise<PaymentResponse>;
}

/**
 * Concrete implementation of IPaymentProvider simulating payment logic.
 *
 * The simulator keeps no state: callbacks resolve against the reference the
 * caller persisted, so a webhook delivered after a restart behaves exactly
 * like one delivered in the process that initiated the payment.
 */
export class SandboxPaymentProvider implements IPaymentProvider {
  public getName(): string {
    return "SANDBOX_PROVIDER";
  }

  public async initiatePayment(paymentId: string, amount: number, currency: string): Promise<PaymentResponse> {
    const gatewayReference = `sandbox-ref-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    return {
      gatewayReference,
      status: "PROCESSING"
    };
  }

  public async completePayment(gatewayReference: string, success: boolean): Promise<PaymentResponse> {
    if (success) {
      return {
        gatewayReference,
        status: "SUCCEEDED",
        transactionHash: `tx-hash-${Math.random().toString(36).substring(2, 15).toUpperCase()}`
      };
    } else {
      return {
        gatewayReference,
        status: "FAILED",
        errorCode: "INSUFFICIENT_FUNDS",
        errorMessage: "Simulated sandbox transaction declined due to insufficient customer balances."
      };
    }
  }
}
