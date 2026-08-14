"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionToken = void 0;
/**
 * SubscriptionToken wrapping reactive observers disposables subscriptions.
 */
class SubscriptionToken {
    unsubscribe;
    constructor(unsubscribe) {
        this.unsubscribe = unsubscribe;
    }
    dispose() {
        this.unsubscribe();
    }
}
exports.SubscriptionToken = SubscriptionToken;
