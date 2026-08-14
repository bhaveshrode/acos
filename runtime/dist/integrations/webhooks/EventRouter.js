"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRouter = void 0;
/**
 * EventRouter mapping endpoints to callbacks from registry.
 */
class EventRouter {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    route(endpoint) {
        return this.registry.getCallback(endpoint);
    }
}
exports.EventRouter = EventRouter;
