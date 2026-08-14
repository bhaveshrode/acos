"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteRegistry = void 0;
/**
 * RouteRegistry maintaining lists of registered client routes, supporting frozen states.
 */
class RouteRegistry {
    routes = [];
    isFrozen = false;
    register(route) {
        if (this.isFrozen) {
            throw new Error("RouteRegistry is frozen and cannot accept further route registrations");
        }
        this.routes.push(route);
    }
    getRoutes() {
        return [...this.routes];
    }
    freeze() {
        this.isFrozen = true;
        Object.freeze(this.routes);
        Object.freeze(this);
    }
}
exports.RouteRegistry = RouteRegistry;
