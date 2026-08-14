"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
/**
 * EventDispatcher routing events to registered providers.
 */
class EventDispatcher {
    providers = new Set();
    registerProvider(provider) {
        this.providers.add(provider);
    }
    dispatch(event) {
        for (const provider of this.providers) {
            provider.collect(event);
        }
    }
}
exports.EventDispatcher = EventDispatcher;
