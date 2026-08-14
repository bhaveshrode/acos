"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutResolver = void 0;
/**
 * LayoutResolver resolving registered layout descriptors by identifiers.
 */
class LayoutResolver {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    resolve(id) {
        const descriptor = this.registry.get(id);
        if (!descriptor) {
            throw new Error(`Layout with identifier ${id} is not registered`);
        }
        return descriptor;
    }
}
exports.LayoutResolver = LayoutResolver;
