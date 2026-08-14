"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyAdapter = void 0;
/**
 * ShopifyAdapter adapting external Shopify commerce APIs.
 */
class ShopifyAdapter {
    async syncOrder(orderId, details) {
        return `shopify_order_${orderId}`;
    }
    async syncInventory(productId, quantity) {
        return quantity >= 0;
    }
}
exports.ShopifyAdapter = ShopifyAdapter;
