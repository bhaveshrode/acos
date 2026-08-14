"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateSnapshot = void 0;
/**
 * StateSnapshot representing deep-frozen read-only states snapshots trees.
 */
class StateSnapshot {
    data;
    timestamp;
    constructor(data, timestamp = Date.now()) {
        this.data = data;
        this.timestamp = timestamp;
        this.deepFreeze(this.data);
        Object.freeze(this);
    }
    deepFreeze(obj) {
        if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
            Object.freeze(obj);
            Object.keys(obj).forEach((key) => this.deepFreeze(obj[key]));
        }
        return obj;
    }
}
exports.StateSnapshot = StateSnapshot;
