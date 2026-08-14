"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionCacheInvalidator = void 0;
/**
 * PermissionCacheInvalidator invalidating cached user permission entries upon authentication state transitions.
 */
class PermissionCacheInvalidator {
    cache;
    observer;
    subscription;
    constructor(cache, observer) {
        this.cache = cache;
        this.observer = observer;
        this.subscription = this.observer.observe((ev) => {
            if (ev.type === "logout" || ev.type === "expired") {
                if (ev.session?.userId) {
                    this.cache.invalidate(ev.session.userId);
                }
                else {
                    this.cache.clear();
                }
            }
        });
    }
    dispose() {
        if (this.subscription && typeof this.subscription.dispose === "function") {
            this.subscription.dispose();
        }
    }
}
exports.PermissionCacheInvalidator = PermissionCacheInvalidator;
