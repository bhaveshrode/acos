"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageContext = void 0;
/**
 * PageContext carrying parameters, query segment structures, and auth/layout properties.
 */
class PageContext {
    metadata;
    routeParams;
    queryParams;
    layoutContext;
    authState;
    constructor(metadata, routeParams = {}, queryParams = {}, layoutContext = null, authState = null) {
        this.metadata = metadata;
        this.routeParams = routeParams;
        this.queryParams = queryParams;
        this.layoutContext = layoutContext;
        this.authState = authState;
        Object.freeze(this.routeParams);
        Object.freeze(this.queryParams);
        Object.freeze(this);
    }
}
exports.PageContext = PageContext;
