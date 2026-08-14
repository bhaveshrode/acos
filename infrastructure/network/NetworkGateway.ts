/**
 * NetworkGateway routing traffic between endpoints.
 */
export class NetworkGateway {
  private readonly routes = new Map<string, string>();

  public addRoute(path: string, targetEndpoint: string): void {
    this.routes.set(path.toLowerCase(), targetEndpoint);
  }

  public resolveTarget(path: string): string | undefined {
    const key = path.toLowerCase();
    for (const [route, target] of this.routes.entries()) {
      if (key.startsWith(route)) {
        return target;
      }
    }
    return undefined;
  }

  public getCorsSettings(): { allowedOrigins: string[]; allowedMethods: string[] } {
    return {
      allowedOrigins: ["*"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    };
  }
}
