"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcommerceFactory = void 0;
const ShopifyAdapter_js_1 = require("./ShopifyAdapter.js");
const WooCommerceAdapter_js_1 = require("./WooCommerceAdapter.js");
/**
 * EcommerceFactory constructing commerce adapters.
 */
class EcommerceFactory {
    static createShopifyAdapter() {
        return new ShopifyAdapter_js_1.ShopifyAdapter();
    }
    static createWooCommerceAdapter() {
        return new WooCommerceAdapter_js_1.WooCommerceAdapter();
    }
    createShopifyAdapter() {
        return EcommerceFactory.createShopifyAdapter();
    }
    createWooCommerceAdapter() {
        return EcommerceFactory.createWooCommerceAdapter();
    }
}
exports.EcommerceFactory = EcommerceFactory;
