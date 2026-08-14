"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentContext = void 0;
/**
 * ComponentContext carrying component configuration metadata and rendering services.
 */
class ComponentContext {
    metadata;
    services;
    timestamp;
    constructor(metadata, services = {}, timestamp = Date.now()) {
        this.metadata = metadata;
        this.services = services;
        this.timestamp = timestamp;
        Object.freeze(this.services);
        Object.freeze(this);
    }
}
exports.ComponentContext = ComponentContext;
