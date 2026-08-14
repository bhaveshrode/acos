"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowObserver = void 0;
const SubscriptionToken_js_1 = require("../state/SubscriptionToken.js");
/**
 * WorkflowObserver subscribing to workflow lifecycles updates.
 */
class WorkflowObserver {
    dispatcher;
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    observe(callback) {
        const unsub = this.dispatcher.subscribe(callback);
        return new SubscriptionToken_js_1.SubscriptionToken(unsub);
    }
}
exports.WorkflowObserver = WorkflowObserver;
