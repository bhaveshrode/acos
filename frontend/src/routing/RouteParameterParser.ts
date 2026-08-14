/**
 * RouteParameterParser parsing parameters from matched URL segments.
 */
export class RouteParameterParser {
  public static parse(pathPattern: string, path: string): Record<string, string> {
    const params: Record<string, string> = {};
    const patternSegments = pathPattern.split("/");
    const pathSegments = path.split("/");

    patternSegments.forEach((segment, index) => {
      if (segment.startsWith(":")) {
        const name = segment.substring(1);
        params[name] = pathSegments[index] || "";
      }
    });

    return params;
  }
}
