import { IPaymentGateway } from "./IPaymentGateway.js";

/**
 * StripeAdapter adapting external Stripe SDK APIs.
 */
export class StripeAdapter implements IPaymentGateway {
  public async createCustomer(email: string): Promise<string> {
    return `cus_stripe_${email.replace("@", "_")}`;
  }

  public async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string
  ): Promise<string> {
    return `pi_stripe_${customerId}_${amount}_${currency.toLowerCase()}`;
  }

  public async refund(paymentIntentId: string, amount: number): Promise<boolean> {
    return paymentIntentId.startsWith("pi_stripe_");
  }
}
