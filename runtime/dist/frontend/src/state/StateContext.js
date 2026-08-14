"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateContext = void 0;
/**
 * StateContext encapsulating configuration options and registries references.
 */
class StateContext {
    options;
    registry;
    constructor(options, registry) {
        this.options = options;
        this.registry = registry;
        Object.freeze(this);
    }
}
exports.StateContext = StateContext;
