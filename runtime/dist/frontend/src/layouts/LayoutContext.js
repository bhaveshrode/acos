"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutContext = void 0;
/**
 * LayoutContext carrying structural metadata, route state, and active responsive parameters.
 */
class LayoutContext {
    metadata;
    routeInfo;
    viewport;
    registeredRegions;
    constructor(metadata, routeInfo = {}, viewport = "Desktop", registeredRegions = []) {
        this.metadata = metadata;
        this.routeInfo = routeInfo;
        this.viewport = viewport;
        this.registeredRegions = registeredRegions;
        Object.freeze(this.routeInfo);
        Object.freeze(this.registeredRegions);
        Object.freeze(this);
    }
}
exports.LayoutContext = LayoutContext;
