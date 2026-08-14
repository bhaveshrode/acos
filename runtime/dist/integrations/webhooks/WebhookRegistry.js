"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookRegistry = void 0;
/**
 * WebhookRegistry cataloging callback hooks.
 */
class WebhookRegistry {
    callbacks = new Map();
    registerCallback(endpoint, callback) {
        this.callbacks.set(endpoint, callback);
    }
    getCallback(endpoint) {
        return this.callbacks.get(endpoint);
    }
}
exports.WebhookRegistry = WebhookRegistry;
