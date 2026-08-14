"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteResolver = void 0;
const ResolvedRoute_js_1 = require("./ResolvedRoute.js");
/**
 * RouteResolver compiling and outputting a ResolvedRoute snapshot.
 */
class RouteResolver {
    async resolve(route, params = {}) {
        let component = route.component;
        if (typeof component === "function") {
            try {
                const result = component();
                if (result && typeof result.then === "function") {
                    const module = await result;
                    component = module.default || module;
                }
            }
            catch {
                // preserve as is
            }
        }
        return new ResolvedRoute_js_1.ResolvedRoute(route, component, route.layout, params, route.meta || {});
    }
}
exports.RouteResolver = RouteResolver;
