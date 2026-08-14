import { VersionResolver } from "./VersionResolver.js";

/**
 * UrlSegmentVersionResolver resolving API version from path regex match segments.
 */
export class UrlSegmentVersionResolver implements VersionResolver {
  public resolve(req: any): string | undefined {
    const path = req.path || req.url || "";
    const match = path.match(/\/v(\d+(?:\.\d+)?)/i);
    return match ? match[1] : undefined;
  }
}
