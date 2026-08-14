"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateSerializer = void 0;
const StateSnapshot_js_1 = require("./StateSnapshot.js");
/**
 * StateSerializer providing static parsing utilities.
 */
class StateSerializer {
    static serialize(snapshot) {
        return JSON.stringify({
            data: snapshot.data,
            timestamp: snapshot.timestamp
        });
    }
    static deserialize(serialized) {
        const parsed = JSON.parse(serialized);
        return new StateSnapshot_js_1.StateSnapshot(parsed.data, parsed.timestamp);
    }
}
exports.StateSerializer = StateSerializer;
