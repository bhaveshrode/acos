"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBatcher = void 0;
/**
 * EventBatcher buffering events before network uploads.
 */
class EventBatcher {
    batch = [];
    addToBatch(event) {
        this.batch.push(event);
    }
    getBatch() {
        return [...this.batch];
    }
    clear() {
        this.batch = [];
    }
    size() {
        return this.batch.length;
    }
}
exports.EventBatcher = EventBatcher;
