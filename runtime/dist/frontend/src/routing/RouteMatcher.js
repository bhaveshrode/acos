"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteMatcher = void 0;
/**
 * RouteMatcher resolving dynamic segment parameters and URL paths.
 */
class RouteMatcher {
    match(routes, path) {
        for (const route of routes) {
            const result = this.matchRoute(route, path);
            if (result)
                return result;
        }
        return null;
    }
    matchRoute(route, path) {
        const paramNames = [];
        const regexPath = route.path.replace(/:([^/]+)/g, (_, name) => {
            paramNames.push(name);
            return "([^/]+)";
        });
        const regex = new RegExp(`^${regexPath}$`);
        const match = path.match(regex);
        if (match) {
            const params = {};
            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });
            return { route, params };
        }
        if (route.children) {
            for (const child of route.children) {
                const fullPath = `${route.path === "/" ? "" : route.path}/${child.path}`.replace(/\/+/g, "/");
                const childResult = this.matchRoute({ ...child, path: fullPath }, path);
                if (childResult)
                    return childResult;
            }
        }
        return null;
    }
}
exports.RouteMatcher = RouteMatcher;
