"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionProvider = void 0;
const PermissionResolver_js_1 = require("../authentication/PermissionResolver.js");
/**
 * PermissionProvider loading permissions resolved profiles from active sessions.
 */
class PermissionProvider {
    cache;
    constructor(cache) {
        this.cache = cache;
    }
    getPermissions(user) {
        const cached = this.cache.get(user.userId);
        if (cached)
            return cached;
        const resolved = PermissionResolver_js_1.PermissionResolver.resolvePermissions(user);
        this.cache.set(user.userId, resolved);
        return resolved;
    }
    clearCache(userId) {
        this.cache.invalidate(userId);
    }
}
exports.PermissionProvider = PermissionProvider;
