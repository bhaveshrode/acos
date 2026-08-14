"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormResolver = void 0;
/**
 * FormResolver resolving registered FormDescriptors by identifier.
 */
class FormResolver {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    resolve(id) {
        const descriptor = this.registry.get(id);
        if (!descriptor) {
            throw new Error(`Form with identifier ${id} is not registered`);
        }
        return descriptor;
    }
}
exports.FormResolver = FormResolver;
