"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalAdapter = void 0;
/**
 * PayPalAdapter adapting external PayPal SDK APIs.
 */
class PayPalAdapter {
    async createCustomer(email) {
        return `cus_paypal_${email.replace("@", "_")}`;
    }
    async createPaymentIntent(amount, currency, customerId) {
        return `pi_paypal_${customerId}_${amount}_${currency.toLowerCase()}`;
    }
    async refund(paymentIntentId, amount) {
        return paymentIntentId.startsWith("pi_paypal_");
    }
}
exports.PayPalAdapter = PayPalAdapter;
