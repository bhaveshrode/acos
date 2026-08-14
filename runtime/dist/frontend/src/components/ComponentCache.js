"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentCache = void 0;
/**
 * ComponentCache caching component classes to prevent repeated resolutions.
 */
class ComponentCache {
    cache = new Map();
    set(key, component) {
        this.cache.set(key, component);
    }
    get(key) {
        return this.cache.get(key);
    }
    clear() {
        this.cache.clear();
    }
}
exports.ComponentCache = ComponentCache;
