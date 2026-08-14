/**
 * IEcommerceProvider interface declaring orders and inventory sync hooks.
 */
export interface IEcommerceProvider {
  syncOrder(
    orderId: string,
    details: Record<string, any>
  ): Promise<string>;
  syncInventory(productId: string, quantity: number): Promise<boolean>;
}
