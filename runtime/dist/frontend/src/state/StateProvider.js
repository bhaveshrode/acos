"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateProvider = void 0;
/**
 * StateProvider exposing registered store context mappings.
 */
class StateProvider {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    getRegistry() {
        return this.registry;
    }
}
exports.StateProvider = StateProvider;
