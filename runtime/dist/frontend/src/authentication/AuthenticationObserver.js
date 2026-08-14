"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationObserver = void 0;
const SubscriptionToken_js_1 = require("../state/SubscriptionToken.js");
/**
 * AuthenticationObserver listening to dispatcher notifications returning SubscriptionTokens.
 */
class AuthenticationObserver {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    observe(callback) {
        const unsub = this.dispatcher.subscribe(callback);
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.AuthenticationObserver = AuthenticationObserver;
