"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeAdapter = void 0;
/**
 * StripeAdapter adapting external Stripe SDK APIs.
 */
class StripeAdapter {
    async createCustomer(email) {
        return `cus_stripe_${email.replace("@", "_")}`;
    }
    async createPaymentIntent(amount, currency, customerId) {
        return `pi_stripe_${customerId}_${amount}_${currency.toLowerCase()}`;
    }
    async refund(paymentIntentId, amount) {
        return paymentIntentId.startsWith("pi_stripe_");
    }
}
exports.StripeAdapter = StripeAdapter;
