/**
 * PermissionCache caching lists of resolved permissions to prevent redundant resolutions.
 */
export class PermissionCache {
  private readonly cache = new Map<string, string[]>();

  public set(userId: string, permissions: string[]): void {
    this.cache.set(userId, [...permissions]);
  }

  public get(userId: string): string[] | undefined {
    return this.cache.get(userId);
  }

  public invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  public clear(): void {
    this.cache.clear();
  }
}
