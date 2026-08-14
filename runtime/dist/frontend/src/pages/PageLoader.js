"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageLoader = void 0;
/**
 * PageLoader asynchronously resolving page classes on demand.
 */
class PageLoader {
    async load(importFn) {
        const module = await importFn();
        return module.default || Object.values(module)[0];
    }
}
exports.PageLoader = PageLoader;
