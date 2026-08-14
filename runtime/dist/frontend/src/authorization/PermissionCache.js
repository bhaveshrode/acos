"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionCache = void 0;
/**
 * PermissionCache caching lists of resolved permissions to prevent redundant resolutions.
 */
class PermissionCache {
    cache = new Map();
    set(userId, permissions) {
        this.cache.set(userId, [...permissions]);
    }
    get(userId) {
        return this.cache.get(userId);
    }
    invalidate(userId) {
        this.cache.delete(userId);
    }
    clear() {
        this.cache.clear();
    }
}
exports.PermissionCache = PermissionCache;
