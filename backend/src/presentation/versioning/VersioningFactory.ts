import { HeaderVersionResolver } from "./HeaderVersionResolver.js";
import { QueryStringVersionResolver } from "./QueryStringVersionResolver.js";
import { UrlSegmentVersionResolver } from "./UrlSegmentVersionResolver.js";
import { MediaTypeVersionResolver } from "./MediaTypeVersionResolver.js";
import { VersionSelector } from "./VersionSelector.js";
import { VersionRouter } from "./VersionRouter.js";
import { VersioningOptions } from "./VersioningOptions.js";
import { VersionPolicy } from "./VersionPolicy.js";
import { CompatibilityChecker } from "./CompatibilityChecker.js";

/**
 * VersioningFactory building resolvers, selectors, routers, and compatibility checkers.
 */
export class VersioningFactory {
  public static createResolvers(): any[] {
    return [
      new HeaderVersionResolver(),
      new QueryStringVersionResolver(),
      new UrlSegmentVersionResolver(),
      new MediaTypeVersionResolver()
    ];
  }

  public static createSelector(options: VersioningOptions): VersionSelector {
    return new VersionSelector(this.createResolvers(), options);
  }

  public static createRouter(): VersionRouter {
    return new VersionRouter();
  }

  public static createCompatibilityChecker(policy: VersionPolicy): CompatibilityChecker {
    return new CompatibilityChecker(policy);
  }
}
