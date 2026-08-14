/**
 * RequestBinder merging multiple HTTP request sources into typed DTO targets.
 */
export class RequestBinder {
  public bind<T>(request: any, targetClass?: new (data: any) => T): T {
    const merged = {
      ...(request.params || {}),
      ...(request.query || {}),
      ...(request.body || {})
    };
    if (targetClass) {
      return new targetClass(merged);
    }
    return merged as T;
  }
}
