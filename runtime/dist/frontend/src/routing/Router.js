"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const RouteContext_js_1 = require("./RouteContext.js");
const QueryParameterParser_js_1 = require("./QueryParameterParser.js");
/**
 * Router driving application routing lifecycle states, implementing IRouter.
 */
class Router {
    registry;
    matcher;
    resolver;
    navigationManager;
    guardPipeline;
    currentContext;
    listeners = [];
    constructor(registry, matcher, resolver, navigationManager, guardPipeline) {
        this.registry = registry;
        this.matcher = matcher;
        this.resolver = resolver;
        this.navigationManager = navigationManager;
        this.guardPipeline = guardPipeline;
        this.navigationManager.onPopState(async (path) => {
            await this.handleNavigation(path);
        });
    }
    async start(initialPath = "/") {
        await this.handleNavigation(initialPath);
    }
    async navigate(path, options) {
        const [pathname, search] = path.split("?");
        const match = this.matcher.match(this.registry.getRoutes(), pathname);
        if (!match) {
            throw new Error(`No route matches path: ${pathname}`);
        }
        const query = QueryParameterParser_js_1.QueryParameterParser.parse(search || "");
        const context = new RouteContext_js_1.RouteContext(pathname, match.params, query, match.route.meta || {});
        const guards = match.route.guards || [];
        const guardResult = await this.guardPipeline.execute(guards, context);
        if (!guardResult.allowed) {
            if (guardResult.redirectUrl) {
                await this.navigate(guardResult.redirectUrl, options);
            }
            return;
        }
        this.navigationManager.navigate(path, options);
        this.currentContext = context;
        this.notify(context);
    }
    getCurrentContext() {
        return this.currentContext;
    }
    onRouteChanged(callback) {
        this.listeners.push(callback);
    }
    async handleNavigation(path) {
        const [pathname, search] = path.split("?");
        const match = this.matcher.match(this.registry.getRoutes(), pathname);
        if (!match)
            return;
        const query = QueryParameterParser_js_1.QueryParameterParser.parse(search || "");
        const context = new RouteContext_js_1.RouteContext(pathname, match.params, query, match.route.meta || {});
        const guards = match.route.guards || [];
        const guardResult = await this.guardPipeline.execute(guards, context);
        if (!guardResult.allowed) {
            if (guardResult.redirectUrl) {
                await this.handleNavigation(guardResult.redirectUrl);
            }
            return;
        }
        this.currentContext = context;
        this.notify(context);
    }
    notify(context) {
        for (const listener of this.listeners) {
            listener(context);
        }
    }
}
exports.Router = Router;
