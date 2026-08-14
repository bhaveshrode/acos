import { ApiVersion } from "./ApiVersion.js";

/**
 * VersioningOptions defines default version settings.
 */
export class VersioningOptions {
  constructor(
    public readonly defaultVersion: ApiVersion = new ApiVersion(1, 0),
    public readonly assumeDefaultVersionWhenUnspecified: boolean = true,
    public readonly reportApiVersions: boolean = true
  ) {}
}
