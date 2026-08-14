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
 */
export class SandboxPaymentProvider implements IPaymentProvider {
  private readonly initiated = new Map<string, { paymentId: string; amount: number; currency: string }>();

  public getName(): string {
    return "SANDBOX_PROVIDER";
  }

  public async initiatePayment(paymentId: string, amount: number, currency: string): Promise<PaymentResponse> {
    const gatewayReference = `sandbox-ref-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    this.initiated.set(gatewayReference, { paymentId, amount, currency });
    
    return {
      gatewayReference,
      status: "PROCESSING"
    };
  }

  public async completePayment(gatewayReference: string, success: boolean): Promise<PaymentResponse> {
    const item = this.initiated.get(gatewayReference);
    if (!item) {
      return {
        gatewayReference,
        status: "FAILED",
        errorCode: "REF_NOT_FOUND",
        errorMessage: "Payment lookup failed: Gateway reference not found."
      };
    }

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

  public clear(): void {
    this.initiated.clear();
  }
}
