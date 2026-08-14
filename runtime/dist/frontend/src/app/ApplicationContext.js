"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationContext = void 0;
/**
 * ApplicationContext carrying global runtime options, states, and registries.
 */
class ApplicationContext {
    options;
    state;
    services;
    constructor(options, state, services = new Map()) {
        this.options = options;
        this.state = state;
        this.services = services;
    }
    registerService(name, service) {
        this.services.set(name, service);
    }
    getService(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not found in ApplicationContext`);
        }
        return service;
    }
}
exports.ApplicationContext = ApplicationContext;
