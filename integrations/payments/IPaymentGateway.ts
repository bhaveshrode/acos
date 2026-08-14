/**
 * IPaymentGateway declaring base customer and payment intent creation hooks.
 */
export interface IPaymentGateway {
  createCustomer(email: string): Promise<string>;
  createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string
  ): Promise<string>;
  refund(paymentIntentId: string, amount: number): Promise<boolean>;
}
