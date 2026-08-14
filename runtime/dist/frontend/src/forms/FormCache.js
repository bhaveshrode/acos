"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormCache = void 0;
/**
 * FormCache caching loaded form classes to avoid redundant resolutions.
 */
class FormCache {
    cache = new Map();
    set(key, formClass) {
        this.cache.set(key, formClass);
    }
    get(key) {
        return this.cache.get(key);
    }
    invalidate(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
}
exports.FormCache = FormCache;
