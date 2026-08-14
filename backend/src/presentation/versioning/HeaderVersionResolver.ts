import { VersionResolver } from "./VersionResolver.js";

/**
 * HeaderVersionResolver resolving API version from request header keys.
 */
export class HeaderVersionResolver implements VersionResolver {
  constructor(private readonly headerName: string = "X-API-Version") {}

  public resolve(req: any): string | undefined {
    return req.headers?.[this.headerName.toLowerCase()];
  }
}
