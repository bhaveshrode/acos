import { ShopifyAdapter } from "./ShopifyAdapter.js";
import { WooCommerceAdapter } from "./WooCommerceAdapter.js";
import { IEcommerceProvider } from "./IEcommerceProvider.js";

/**
 * EcommerceFactory constructing commerce adapters.
 */
export class EcommerceFactory {
  public static createShopifyAdapter(): IEcommerceProvider {
    return new ShopifyAdapter();
  }

  public static createWooCommerceAdapter(): IEcommerceProvider {
    return new WooCommerceAdapter();
  }

  public createShopifyAdapter(): IEcommerceProvider {
    return EcommerceFactory.createShopifyAdapter();
  }

  public createWooCommerceAdapter(): IEcommerceProvider {
    return EcommerceFactory.createWooCommerceAdapter();
  }
}
