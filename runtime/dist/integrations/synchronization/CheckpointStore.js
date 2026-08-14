"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointStore = void 0;
/**
 * CheckpointStore tracking synchronization cursor timestamps.
 */
class CheckpointStore {
    store = new Map();
    saveCheckpoint(key, value) {
        this.store.set(key, value);
    }
    getCheckpoint(key) {
        return this.store.get(key);
    }
}
exports.CheckpointStore = CheckpointStore;
