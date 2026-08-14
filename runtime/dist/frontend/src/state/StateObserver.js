"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateObserver = void 0;
const SubscriptionToken_js_1 = require("./SubscriptionToken.js");
/**
 * StateObserver wrapping subscriptions in Disposable SubscriptionTokens.
 */
class StateObserver {
    store;
    constructor(store) {
        this.store = store;
    }
    observe(selector, callback) {
        let lastValue = selector(this.store.getState());
        const unsub = this.store.subscribe((state) => {
            const nextValue = selector(state);
            if (nextValue !== lastValue) {
                lastValue = nextValue;
                callback(nextValue);
            }
        });
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.StateObserver = StateObserver;
