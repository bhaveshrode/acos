import { IEcommerceProvider } from "./IEcommerceProvider.js";

/**
 * ShopifyAdapter adapting external Shopify commerce APIs.
 */
export class ShopifyAdapter implements IEcommerceProvider {
  public async syncOrder(
    orderId: string,
    details: Record<string, any>
  ): Promise<string> {
    return `shopify_order_${orderId}`;
  }

  public async syncInventory(productId: string, quantity: number): Promise<boolean> {
    return quantity >= 0;
  }
}
