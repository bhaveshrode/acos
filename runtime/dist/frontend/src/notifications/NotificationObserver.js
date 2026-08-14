"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationObserver = void 0;
const SubscriptionToken_js_1 = require("../state/SubscriptionToken.js");
/**
 * NotificationObserver subscribing to alerts changes.
 */
class NotificationObserver {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    observe(callback) {
        const unsub = this.dispatcher.subscribe(callback);
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.NotificationObserver = NotificationObserver;
