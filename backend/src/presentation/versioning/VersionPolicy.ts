import { ApiVersion } from "./ApiVersion.js";

/**
 * VersionPolicy defining lists of supported and deprecated versions.
 */
export class VersionPolicy {
  constructor(
    public readonly supportedVersions: ApiVersion[] = [],
    public readonly deprecatedVersions: ApiVersion[] = []
  ) {}

  public isSupported(version: ApiVersion): boolean {
    return this.supportedVersions.some((v) => v.equals(version));
  }

  public isDeprecated(version: ApiVersion): boolean {
    return this.deprecatedVersions.some((v) => v.equals(version));
  }
}
