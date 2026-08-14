"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentObserver = void 0;
const SubscriptionToken_js_1 = require("../state/SubscriptionToken.js");
/**
 * ComponentObserver subscribing to lifecycle events returning SubscriptionToken wrappers.
 */
class ComponentObserver {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    observe(callback) {
        const unsub = this.dispatcher.subscribe(callback);
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.ComponentObserver = ComponentObserver;
