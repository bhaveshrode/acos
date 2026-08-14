"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationObserver = void 0;
const SubscriptionToken_js_1 = require("../state/SubscriptionToken.js");
/**
 * AuthorizationObserver observing dispatcher events returning SubscriptionToken wrappers.
 */
class AuthorizationObserver {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    observe(callback) {
        const unsub = this.dispatcher.subscribe(callback);
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.AuthorizationObserver = AuthorizationObserver;
