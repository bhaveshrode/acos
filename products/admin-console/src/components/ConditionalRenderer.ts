import { ClaimsPrincipal } from "../authentication/ClaimsPrincipal.js";
import { PermissionResolver } from "../authentication/PermissionResolver.js";
import { ComponentMetadata } from "./ComponentMetadata.js";

/**
 * ConditionalRenderer deciding whether components are rendered according to features and permissions checks.
 */
export class ConditionalRenderer {
  constructor(
    private readonly checkFeatureFlag: (flag: string) => boolean = () => true
  ) {}

  public shouldRender(metadata: ComponentMetadata, user?: ClaimsPrincipal): boolean {
    if (metadata.featureFlags) {
      for (const flag of metadata.featureFlags) {
        if (!this.checkFeatureFlag(flag)) return false;
      }
    }

    if (metadata.permissions && metadata.permissions.length > 0) {
      if (!user) return false;
      for (const permission of metadata.permissions) {
        if (!PermissionResolver.hasPermission(user, permission)) {
          return false;
        }
      }
    }

    return true;
  }
}
