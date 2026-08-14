"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormObserver = void 0;
const SubscriptionToken_js_1 = require("../state/SubscriptionToken.js");
/**
 * FormObserver observing FormLifecycleEvents returning SubscriptionToken wrappers.
 */
class FormObserver {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    observe(callback) {
        const unsub = this.dispatcher.subscribe(callback);
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.FormObserver = FormObserver;
