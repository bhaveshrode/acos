/**
 * RouteParameterExtractor parsing URL path variables.
 */
export class RouteParameterExtractor {
  public extract(request: any): Record<string, any> {
    return request.params || {};
  }
}
