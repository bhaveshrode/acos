import { IEcommerceProvider } from "./IEcommerceProvider.js";

/**
 * WooCommerceAdapter adapting WooCommerce commerce APIs.
 */
export class WooCommerceAdapter implements IEcommerceProvider {
  public async syncOrder(
    orderId: string,
    details: Record<string, any>
  ): Promise<string> {
    return `wc_order_${orderId}`;
  }

  public async syncInventory(productId: string, quantity: number): Promise<boolean> {
    return quantity >= 0;
  }
}
