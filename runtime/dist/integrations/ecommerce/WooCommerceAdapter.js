"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WooCommerceAdapter = void 0;
/**
 * WooCommerceAdapter adapting WooCommerce commerce APIs.
 */
class WooCommerceAdapter {
    async syncOrder(orderId, details) {
        return `wc_order_${orderId}`;
    }
    async syncInventory(productId, quantity) {
        return quantity >= 0;
    }
}
exports.WooCommerceAdapter = WooCommerceAdapter;
