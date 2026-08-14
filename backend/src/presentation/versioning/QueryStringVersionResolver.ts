import { VersionResolver } from "./VersionResolver.js";

/**
 * QueryStringVersionResolver resolving API version from URI queries parameters.
 */
export class QueryStringVersionResolver implements VersionResolver {
  constructor(private readonly parameterName: string = "api-version") {}

  public resolve(req: any): string | undefined {
    return req.query?.[this.parameterName];
  }
}
