"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationObserver = void 0;
const SubscriptionToken_js_1 = require("../state/SubscriptionToken.js");
/**
 * ValidationObserver observing validation lifecycle updates returning SubscriptionTokens.
 */
class ValidationObserver {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    observe(callback) {
        const unsub = this.dispatcher.subscribe(callback);
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.ValidationObserver = ValidationObserver;
