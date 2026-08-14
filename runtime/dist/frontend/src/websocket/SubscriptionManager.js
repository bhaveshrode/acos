"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionManager = void 0;
/**
 * SubscriptionManager tracking active topic subscriptions.
 */
class SubscriptionManager {
    subscriptions = new Set();
    subscribe(topic) {
        this.subscriptions.add(topic);
    }
    unsubscribe(topic) {
        this.subscriptions.delete(topic);
    }
    getSubscriptions() {
        return Array.from(this.subscriptions);
    }
}
exports.SubscriptionManager = SubscriptionManager;
