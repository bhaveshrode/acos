"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingFactory = void 0;
const RouteRegistry_js_1 = require("./RouteRegistry.js");
const RouteMatcher_js_1 = require("./RouteMatcher.js");
const RouteResolver_js_1 = require("./RouteResolver.js");
const NavigationManager_js_1 = require("./NavigationManager.js");
const GuardPipeline_js_1 = require("./GuardPipeline.js");
const Router_js_1 = require("./Router.js");
const NavigationStateManager_js_1 = require("./NavigationStateManager.js");
/**
 * RoutingFactory building registries, matchers, resolvers, managers, and routers.
 */
class RoutingFactory {
    static createRegistry() {
        return new RouteRegistry_js_1.RouteRegistry();
    }
    static createMatcher() {
        return new RouteMatcher_js_1.RouteMatcher();
    }
    static createResolver() {
        return new RouteResolver_js_1.RouteResolver();
    }
    static createNavigationManager() {
        return new NavigationManager_js_1.NavigationManager();
    }
    static createGuardPipeline() {
        return new GuardPipeline_js_1.GuardPipeline();
    }
    static createStateManager() {
        return new NavigationStateManager_js_1.NavigationStateManager();
    }
    static createRouter(registry, matcher, resolver, navigationManager, guardPipeline) {
        return new Router_js_1.Router(registry, matcher, resolver, navigationManager, guardPipeline);
    }
}
exports.RoutingFactory = RoutingFactory;
