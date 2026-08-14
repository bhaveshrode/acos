import { ApiVersion } from "./ApiVersion.js";
import { VersionResolver } from "./VersionResolver.js";
import { VersioningOptions } from "./VersioningOptions.js";

/**
 * VersionSelector resolving request version metadata across registries and fallback defaults options.
 */
export class VersionSelector {
  constructor(
    private readonly resolvers: VersionResolver[],
    private readonly options: VersioningOptions
  ) {}

  /**
   * Selects requested API version.
   */
  public select(req: any): ApiVersion {
    for (const resolver of this.resolvers) {
      const versionStr = resolver.resolve(req);
      if (versionStr) {
        try {
          return ApiVersion.parse(versionStr);
        } catch {
          // Fall through
        }
      }
    }
    return this.options.defaultVersion;
  }
}
