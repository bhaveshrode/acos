import { IPaymentGateway } from "../payments/IPaymentGateway.js";

/**
 * PaymentProviderRegistry cataloging payment gateways for dynamic runtime resolution.
 */
export class PaymentProviderRegistry {
  private readonly gateways = new Map<string, IPaymentGateway>();

  public register(name: string, gateway: IPaymentGateway): void {
    this.gateways.set(name.toLowerCase(), gateway);
  }

  public resolve(name: string): IPaymentGateway {
    const g = this.gateways.get(name.toLowerCase());
    if (!g) {
      throw new Error(`Payment gateway provider not found: ${name}`);
    }
    return g;
  }
}
