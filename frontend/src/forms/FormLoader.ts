import { FormResolver } from "./FormResolver.js";
import { FormCache } from "./FormCache.js";
import { LazyFormLoader } from "./LazyFormLoader.js";

/**
 * FormLoader coordinating form class loading operations.
 */
export class FormLoader {
  constructor(
    private readonly resolver: FormResolver,
    private readonly cache: FormCache,
    private readonly lazyLoader: LazyFormLoader
  ) {}

  public loadSync(id: string): any {
    const cached = this.cache.get(id);
    if (cached) return cached;

    const descriptor = this.resolver.resolve(id);
    const formClass = descriptor.formClass;
    this.cache.set(id, formClass);
    return formClass;
  }

  public async loadAsync(id: string, importFn: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    const formClass = await this.lazyLoader.load(importFn);
    this.cache.set(id, formClass);
    return formClass;
  }
}
