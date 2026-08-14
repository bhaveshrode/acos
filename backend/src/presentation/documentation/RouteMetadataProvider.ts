/**
 * RouteMetadataProvider resolves route paths metadata descriptors.
 */
export class RouteMetadataProvider {
  public getRouteSummary(method: string, path: string): string {
    return `${method.toUpperCase()} ${path}`;
  }
}
