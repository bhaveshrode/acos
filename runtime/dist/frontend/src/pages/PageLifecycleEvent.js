"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageLifecycleEvent = void 0;
/**
 * PageLifecycleEvent capturing detailed page lifecycle transitions.
 */
class PageLifecycleEvent {
    pageId;
    type;
    timestamp;
    metadata;
    constructor(pageId, type, timestamp = Date.now(), metadata) {
        this.pageId = pageId;
        this.type = type;
        this.timestamp = timestamp;
        this.metadata = metadata;
        Object.freeze(this);
    }
}
exports.PageLifecycleEvent = PageLifecycleEvent;
