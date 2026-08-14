import { ApiVersion } from "./ApiVersion.js";

/**
 * VersionContext storing resolved API version properties.
 */
export class VersionContext {
  constructor(
    public readonly requestedVersion?: ApiVersion,
    public readonly resolvedVersion?: ApiVersion,
    public readonly isDeprecated: boolean = false
  ) {}
}
