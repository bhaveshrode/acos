import { PermissionCache } from "./PermissionCache.js";
import { AuthenticationObserver } from "../authentication/AuthenticationObserver.js";

/**
 * PermissionCacheInvalidator invalidating cached user permission entries upon authentication state transitions.
 */
export class PermissionCacheInvalidator {
  private readonly subscription: any;

  constructor(
    private readonly cache: PermissionCache,
    private readonly observer: AuthenticationObserver
  ) {
    this.subscription = this.observer.observe((ev) => {
      if (ev.type === "logout" || ev.type === "expired") {
        if (ev.session?.userId) {
          this.cache.invalidate(ev.session.userId);
        } else {
          this.cache.clear();
        }
      }
    });
  }

  public dispose(): void {
    if (this.subscription && typeof this.subscription.dispose === "function") {
      this.subscription.dispose();
    }
  }
}
