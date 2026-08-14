/**
 * LazyFormLoader asynchronously loading form module classes on demand.
 */
export class LazyFormLoader {
  public async load(importFn: () => Promise<any>): Promise<any> {
    const module = await importFn();
    return module.default || Object.values(module)[0];
  }
}
