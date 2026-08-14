"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderRegistry = void 0;
/**
 * PaymentProviderRegistry cataloging payment gateways for dynamic runtime resolution.
 */
class PaymentProviderRegistry {
    gateways = new Map();
    register(name, gateway) {
        this.gateways.set(name.toLowerCase(), gateway);
    }
    resolve(name) {
        const g = this.gateways.get(name.toLowerCase());
        if (!g) {
            throw new Error(`Payment gateway provider not found: ${name}`);
        }
        return g;
    }
}
exports.PaymentProviderRegistry = PaymentProviderRegistry;
