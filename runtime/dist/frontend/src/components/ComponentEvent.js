"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentEvent = void 0;
/**
 * ComponentEvent recording component identifiers and timing parameters.
 */
class ComponentEvent {
    componentId;
    type;
    timestamp;
    metadata;
    constructor(componentId, type, timestamp = Date.now(), metadata) {
        this.componentId = componentId;
        this.type = type;
        this.timestamp = timestamp;
        this.metadata = metadata;
        Object.freeze(this);
    }
}
exports.ComponentEvent = ComponentEvent;
