"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageCache = void 0;
/**
 * PageCache holding active page instances to prevent redundant allocations.
 */
class PageCache {
    cache = new Map();
    set(key, pageInstance) {
        this.cache.set(key, pageInstance);
    }
    get(key) {
        return this.cache.get(key);
    }
    clear() {
        this.cache.clear();
    }
}
exports.PageCache = PageCache;
