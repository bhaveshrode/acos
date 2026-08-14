"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsFactory = void 0;
const StripeAdapter_js_1 = require("./StripeAdapter.js");
const PayPalAdapter_js_1 = require("./PayPalAdapter.js");
const PaymentProviderRegistry_js_1 = require("../registries/PaymentProviderRegistry.js");
/**
 * PaymentsFactory constructing payment gateways and registry mappings.
 */
class PaymentsFactory {
    static createRegistry() {
        return new PaymentProviderRegistry_js_1.PaymentProviderRegistry();
    }
    static createStripeAdapter() {
        return new StripeAdapter_js_1.StripeAdapter();
    }
    static createPayPalAdapter() {
        return new PayPalAdapter_js_1.PayPalAdapter();
    }
    createRegistry() {
        return PaymentsFactory.createRegistry();
    }
    createStripeAdapter() {
        return PaymentsFactory.createStripeAdapter();
    }
    createPayPalAdapter() {
        return PaymentsFactory.createPayPalAdapter();
    }
}
exports.PaymentsFactory = PaymentsFactory;
