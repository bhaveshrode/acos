/**
 * Interface representing a disposable resource (e.g. database pool, file stream, socket client).
 */
export interface IDisposable {
  /**
   * Releases and cleans up the underlying system resources.
   */
  dispose(): void | Promise<void>;
}

/**
 * Utility class to assist in safe cleanup of disposable resources.
 */
export class Disposable {
  /**
   * Safely executes dispose() on a target resource.
   * If the resource is null/undefined or does not implement dispose, fails silently.
   * @param resource The target resource to clean up.
   */
  public static async safeDispose(resource: any): Promise<void> {
    if (resource === null || resource === undefined) return;
    if (typeof resource.dispose === "function") {
      await resource.dispose();
    }
  }

  /**
   * Executes safeDispose() on an array of resources sequentially.
   * @param resources The array of resources to clean up.
   */
  public static async disposeAll(resources: readonly any[]): Promise<void> {
    if (!resources) return;
    for (const res of resources) {
      await Disposable.safeDispose(res);
    }
  }
}
