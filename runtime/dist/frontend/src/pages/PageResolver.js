"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageResolver = void 0;
/**
 * PageResolver resolving registered page descriptors by identifier.
 */
class PageResolver {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    resolve(id) {
        const descriptor = this.registry.get(id);
        if (!descriptor) {
            throw new Error(`Page with identifier ${id} is not registered`);
        }
        return descriptor;
    }
}
exports.PageResolver = PageResolver;
