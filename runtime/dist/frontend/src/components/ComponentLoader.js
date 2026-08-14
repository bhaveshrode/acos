"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentLoader = void 0;
/**
 * ComponentLoader resolving component classes from resolved descriptors.
 */
class ComponentLoader {
    resolver;
    cache;
    lazyLoader;
    constructor(resolver, cache, lazyLoader) {
        this.resolver = resolver;
        this.cache = cache;
        this.lazyLoader = lazyLoader;
    }
    loadSync(id) {
        const cached = this.cache.get(id);
        if (cached)
            return cached;
        const descriptor = this.resolver.resolve(id);
        const compClass = descriptor.componentClass;
        this.cache.set(id, compClass);
        return compClass;
    }
    async loadAsync(id, importFn) {
        const cached = this.cache.get(id);
        if (cached)
            return cached;
        const compClass = await this.lazyLoader.load(importFn);
        this.cache.set(id, compClass);
        return compClass;
    }
}
exports.ComponentLoader = ComponentLoader;
