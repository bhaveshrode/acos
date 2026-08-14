/**
 * ReverseProxy routing network paths to downstream targets.
 */
export class ReverseProxy {
  public route(path: string): string {
    if (path.startsWith("/api")) return "http://backend-api";
    return "http://frontend-static";
  }
}
