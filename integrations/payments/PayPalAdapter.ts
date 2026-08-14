import { IPaymentGateway } from "./IPaymentGateway.js";

/**
 * PayPalAdapter adapting external PayPal SDK APIs.
 */
export class PayPalAdapter implements IPaymentGateway {
  public async createCustomer(email: string): Promise<string> {
    return `cus_paypal_${email.replace("@", "_")}`;
  }

  public async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string
  ): Promise<string> {
    return `pi_paypal_${customerId}_${amount}_${currency.toLowerCase()}`;
  }

  public async refund(paymentIntentId: string, amount: number): Promise<boolean> {
    return paymentIntentId.startsWith("pi_paypal_");
  }
}
