"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutLifecycleEvent = void 0;
/**
 * LayoutLifecycleEvent recording transition details.
 */
class LayoutLifecycleEvent {
    layoutId;
    type;
    timestamp;
    constructor(layoutId, type, timestamp = Date.now()) {
        this.layoutId = layoutId;
        this.type = type;
        this.timestamp = timestamp;
        Object.freeze(this);
    }
}
exports.LayoutLifecycleEvent = LayoutLifecycleEvent;
