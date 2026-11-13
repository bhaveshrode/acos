import { PaymentMethodType } from "acos-backend";
import { IPaymentProvider, PaymentCompletion, PaymentResponse } from "./PaymentProvider.js";

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

  /** The simulator speaks the Stripe callback format, which is how its payments were always recorded. */
  public getMethodType(): PaymentMethodType {
    return PaymentMethodType.STRIPE;
  }

  public async initiatePayment(paymentId: string, amount: number, currency: string): Promise<PaymentResponse> {
    const gatewayReference = `sandbox-ref-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    return {
      gatewayReference,
      status: "PROCESSING"
    };
  }

  public async completePayment(input: PaymentCompletion): Promise<PaymentResponse> {
    if (input.success) {
      return {
        gatewayReference: input.gatewayReference,
        status: "SUCCEEDED",
        transactionHash: `tx-hash-${Math.random().toString(36).substring(2, 15).toUpperCase()}`
      };
    } else {
      return {
        gatewayReference: input.gatewayReference,
        status: "FAILED",
        errorCode: "INSUFFICIENT_FUNDS",
        errorMessage: "Simulated sandbox transaction declined due to insufficient customer balances."
      };
    }
  }
}
