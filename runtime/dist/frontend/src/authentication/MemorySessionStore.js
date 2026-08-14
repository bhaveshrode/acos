"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemorySessionStore = void 0;
/**
 * MemorySessionStore storing sessions in runtime maps.
 */
class MemorySessionStore {
    data = new Map();
    save(key, session) {
        this.data.set(key, session);
    }
    load(key) {
        return this.data.get(key) || null;
    }
    clear(key) {
        this.data.delete(key);
    }
}
exports.MemorySessionStore = MemorySessionStore;
