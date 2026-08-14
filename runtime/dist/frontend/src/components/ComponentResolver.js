"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentResolver = void 0;
/**
 * ComponentResolver retrieving registered ComponentDescriptors.
 */
class ComponentResolver {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    resolve(id) {
        const descriptor = this.registry.get(id);
        if (!descriptor) {
            throw new Error(`Component with identifier ${id} is not registered`);
        }
        return descriptor;
    }
}
exports.ComponentResolver = ComponentResolver;
