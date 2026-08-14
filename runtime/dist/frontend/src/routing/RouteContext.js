"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteContext = void 0;
/**
 * RouteContext representing the active navigation snapshot.
 */
class RouteContext {
    path;
    params;
    query;
    meta;
    constructor(path, params, query, meta = {}) {
        this.path = path;
        this.params = params;
        this.query = query;
        this.meta = meta;
        Object.freeze(this.params);
        Object.freeze(this.query);
        Object.freeze(this.meta);
        Object.freeze(this);
    }
}
exports.RouteContext = RouteContext;
