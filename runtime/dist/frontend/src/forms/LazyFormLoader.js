"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyFormLoader = void 0;
/**
 * LazyFormLoader asynchronously loading form module classes on demand.
 */
class LazyFormLoader {
    async load(importFn) {
        const module = await importFn();
        return module.default || Object.values(module)[0];
    }
}
exports.LazyFormLoader = LazyFormLoader;
