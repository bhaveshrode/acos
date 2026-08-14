"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormLoader = void 0;
/**
 * FormLoader coordinating form class loading operations.
 */
class FormLoader {
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
        const formClass = descriptor.formClass;
        this.cache.set(id, formClass);
        return formClass;
    }
    async loadAsync(id, importFn) {
        const cached = this.cache.get(id);
        if (cached)
            return cached;
        const formClass = await this.lazyLoader.load(importFn);
        this.cache.set(id, formClass);
        return formClass;
    }
}
exports.FormLoader = FormLoader;
