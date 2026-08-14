"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolvedRoute = void 0;
/**
 * ResolvedRoute representing the complete resolved routing layout, metadata, and dynamic component properties.
 */
class ResolvedRoute {
    route;
    component;
    layout;
    params;
    meta;
    constructor(route, component, layout, params = {}, meta = {}) {
        this.route = route;
        this.component = component;
        this.layout = layout;
        this.params = params;
        this.meta = meta;
        Object.freeze(this.params);
        Object.freeze(this.meta);
        Object.freeze(this);
    }
}
exports.ResolvedRoute = ResolvedRoute;
