import { StripeAdapter } from "./StripeAdapter.js";
import { PayPalAdapter } from "./PayPalAdapter.js";
import { IPaymentGateway } from "./IPaymentGateway.js";
import { PaymentProviderRegistry } from "../registries/PaymentProviderRegistry.js";

/**
 * PaymentsFactory constructing payment gateways and registry mappings.
 */
export class PaymentsFactory {
  public static createRegistry(): PaymentProviderRegistry {
    return new PaymentProviderRegistry();
  }

  public static createStripeAdapter(): IPaymentGateway {
    return new StripeAdapter();
  }

  public static createPayPalAdapter(): IPaymentGateway {
    return new PayPalAdapter();
  }

  public createRegistry(): PaymentProviderRegistry {
    return PaymentsFactory.createRegistry();
  }

  public createStripeAdapter(): IPaymentGateway {
    return PaymentsFactory.createStripeAdapter();
  }

  public createPayPalAdapter(): IPaymentGateway {
    return PaymentsFactory.createPayPalAdapter();
  }
}
