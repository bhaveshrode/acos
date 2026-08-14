"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutObserver = void 0;
const SubscriptionToken_js_1 = require("../state/SubscriptionToken.js");
/**
 * LayoutObserver observing structural changes returning SubscriptionToken wrappers.
 */
class LayoutObserver {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    observe(callback) {
        const unsub = this.dispatcher.subscribe(callback);
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.LayoutObserver = LayoutObserver;
