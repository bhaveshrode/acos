"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyComponentLoader = void 0;
/**
 * LazyComponentLoader loading async chunks on demand.
 */
class LazyComponentLoader {
    async load(importFn) {
        const module = await importFn();
        return module.default || Object.values(module)[0];
    }
}
exports.LazyComponentLoader = LazyComponentLoader;
