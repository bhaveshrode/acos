/**
 * PageLoader asynchronously resolving page classes on demand.
 */
export class PageLoader {
  public async load(importFn: () => Promise<any>): Promise<any> {
    const module = await importFn();
    return module.default || Object.values(module)[0];
  }
}
