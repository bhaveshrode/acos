import { ComponentResolver } from "./ComponentResolver.js";
import { ComponentCache } from "./ComponentCache.js";
import { LazyComponentLoader } from "./LazyComponentLoader.js";

/**
 * ComponentLoader resolving component classes from resolved descriptors.
 */
export class ComponentLoader {
  constructor(
    private readonly resolver: ComponentResolver,
    private readonly cache: ComponentCache,
    private readonly lazyLoader: LazyComponentLoader
  ) {}

  public loadSync(id: string): any {
    const cached = this.cache.get(id);
    if (cached) return cached;

    const descriptor = this.resolver.resolve(id);
    const compClass = descriptor.componentClass;
    this.cache.set(id, compClass);
    return compClass;
  }

  public async loadAsync(id: string, importFn: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    const compClass = await this.lazyLoader.load(importFn);
    this.cache.set(id, compClass);
    return compClass;
  }
}
