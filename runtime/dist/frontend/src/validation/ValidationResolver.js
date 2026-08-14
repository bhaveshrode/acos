"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationResolver = void 0;
/**
 * ValidationResolver resolving registered validation descriptors.
 */
class ValidationResolver {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    resolve(id) {
        const descriptor = this.registry.get(id);
        if (!descriptor) {
            throw new Error(`Validation schema with identifier ${id} is not registered`);
        }
        return descriptor;
    }
}
exports.ValidationResolver = ValidationResolver;
