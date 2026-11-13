import { ClaimsPrincipal } from "../authentication/ClaimsPrincipal.js";
import { PermissionResolver as AuthPermissionResolver } from "../authentication/PermissionResolver.js";
import { PermissionCache } from "./PermissionCache.js";

/**
 * PermissionProvider loading permissions resolved profiles from active sessions.
 */
export class PermissionProvider {
  constructor(private readonly cache: PermissionCache) {}

  public getPermissions(user: ClaimsPrincipal): string[] {
    const cached = this.cache.get(user.userId);
    if (cached) return cached;

    const resolved = AuthPermissionResolver.resolvePermissions(user);
    this.cache.set(user.userId, resolved);
    return resolved;
  }

  public clearCache(userId: string): void {
    this.cache.invalidate(userId);
  }
}
