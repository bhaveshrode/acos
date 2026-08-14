"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStorageStatePersistence = void 0;
const StateSerializer_js_1 = require("./StateSerializer.js");
/**
 * SessionStorageStatePersistence saving snapshots to session storage.
 */
class SessionStorageStatePersistence {
    save(key, snapshot) {
        if (typeof sessionStorage !== "undefined") {
            const value = StateSerializer_js_1.StateSerializer.serialize(snapshot);
            sessionStorage.setItem(key, value);
        }
    }
    load(key) {
        if (typeof sessionStorage !== "undefined") {
            const item = sessionStorage.getItem(key);
            if (!item)
                return null;
            return StateSerializer_js_1.StateSerializer.deserialize(item);
        }
        return null;
    }
    clear(key) {
        if (typeof sessionStorage !== "undefined") {
            sessionStorage.removeItem(key);
        }
    }
}
exports.SessionStorageStatePersistence = SessionStorageStatePersistence;
