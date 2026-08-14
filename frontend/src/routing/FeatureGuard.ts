import { IRouteGuard } from "./IRouteGuard.js";
import { RouteContext } from "./RouteContext.js";
import { GuardResult } from "./GuardResult.js";

/**
 * FeatureGuard conditionally enabling routes based on feature config flags returning GuardResult.
 */
export class FeatureGuard implements IRouteGuard {
  constructor(private readonly checkFeatureEnabled: (featureName: string) => boolean) {}

  public async canActivate(context: RouteContext): Promise<GuardResult> {
    const featureName = context.meta.featureFlag;
    if (!featureName) return GuardResult.allow();
    const enabled = this.checkFeatureEnabled(featureName);
    return enabled
      ? GuardResult.allow()
      : GuardResult.deny(`Feature flag ${featureName} is disabled`);
  }
}
