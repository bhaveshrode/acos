import { ApiVersion } from "./ApiVersion.js";

/**
 * VersionRegistry maintaining version mappings associated with routes keys.
 */
export class VersionRegistry {
  private static versionedRoutes = new Map<string, { version: ApiVersion; handler: any }[]>();

  public static registerRoute(path: string, version: ApiVersion, handler: any): void {
    const list = this.versionedRoutes.get(path) || [];
    list.push({ version, handler });
    this.versionedRoutes.set(path, list);
  }

  public static getVersionedRoutes(path: string): { version: ApiVersion; handler: any }[] | undefined {
    return this.versionedRoutes.get(path);
  }

  /**
   * Resets registry map records.
   */
  public static clear(): void {
    this.versionedRoutes.clear();
  }
}
