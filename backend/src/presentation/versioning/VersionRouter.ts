import { ApiVersion } from "./ApiVersion.js";

/**
 * VersionRouter matching requests to versioned handlers with fallback options logic.
 */
export class VersionRouter {
  /**
   * Identifies exact or closest lower versioned route handler matching requested version.
   */
  public selectRouteForVersion(
    routes: { version: ApiVersion; handler: any }[],
    version: ApiVersion
  ): any | undefined {
    const exact = routes.find((r) => r.version.equals(version));
    if (exact) return exact.handler;

    const sorted = [...routes].sort((a, b) => {
      if (a.version.major !== b.version.major) return b.version.major - a.version.major;
      return b.version.minor - a.version.minor;
    });

    const fallback = sorted.find((r) => {
      if (r.version.major < version.major) return true;
      if (r.version.major === version.major && r.version.minor <= version.minor) return true;
      return false;
    });

    return fallback?.handler;
  }
}
