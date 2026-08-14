"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageStatePersistence = void 0;
const StateSerializer_js_1 = require("./StateSerializer.js");
/**
 * LocalStorageStatePersistence saving snapshots to local storage.
 */
class LocalStorageStatePersistence {
    save(key, snapshot) {
        if (typeof localStorage !== "undefined") {
            const value = StateSerializer_js_1.StateSerializer.serialize(snapshot);
            localStorage.setItem(key, value);
        }
    }
    load(key) {
        if (typeof localStorage !== "undefined") {
            const item = localStorage.getItem(key);
            if (!item)
                return null;
            return StateSerializer_js_1.StateSerializer.deserialize(item);
        }
        return null;
    }
    clear(key) {
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem(key);
        }
    }
}
exports.LocalStorageStatePersistence = LocalStorageStatePersistence;
