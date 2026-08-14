"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionRecoveryManager = void 0;
const WebSocketMessage_js_1 = require("./WebSocketMessage.js");
/**
 * SessionRecoveryManager re-subscribing channels on reconnects.
 */
class SessionRecoveryManager {
    subscriptionManager;
    constructor(subscriptionManager) {
        this.subscriptionManager = subscriptionManager;
    }
    recoverSession(client) {
        const active = this.subscriptionManager.getSubscriptions();
        for (const topic of active) {
            client.send(new WebSocketMessage_js_1.WebSocketMessage("subscribe", { topic }, "system"));
        }
    }
}
exports.SessionRecoveryManager = SessionRecoveryManager;
