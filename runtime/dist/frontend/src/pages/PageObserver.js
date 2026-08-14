"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageObserver = void 0;
const SubscriptionToken_js_1 = require("../state/SubscriptionToken.js");
/**
 * PageObserver observing page lifecycle transitions.
 */
class PageObserver {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    observe(callback) {
        const unsub = this.dispatcher.subscribe(callback);
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.PageObserver = PageObserver;
