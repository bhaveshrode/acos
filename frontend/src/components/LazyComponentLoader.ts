/**
 * LazyComponentLoader loading async chunks on demand.
 */
export class LazyComponentLoader {
  public async load(importFn: () => Promise<any>): Promise<any> {
    const module = await importFn();
    return module.default || Object.values(module)[0];
  }
}
