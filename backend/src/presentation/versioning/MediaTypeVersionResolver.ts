import { VersionResolver } from "./VersionResolver.js";

/**
 * MediaTypeVersionResolver resolving API version from Accept media parameter blocks.
 */
export class MediaTypeVersionResolver implements VersionResolver {
  public resolve(req: any): string | undefined {
    const accept = req.headers?.["accept"];
    if (!accept) return undefined;
    const match = accept.match(/v=(\d+(?:\.\d+)?)/i);
    return match ? match[1] : undefined;
  }
}
