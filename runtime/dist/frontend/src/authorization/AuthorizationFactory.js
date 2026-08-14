"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationFactory = void 0;
const PolicyRegistry_js_1 = require("./PolicyRegistry.js");
const RoleAuthorizationHandler_js_1 = require("./RoleAuthorizationHandler.js");
const PermissionAuthorizationHandler_js_1 = require("./PermissionAuthorizationHandler.js");
const ClaimAuthorizationHandler_js_1 = require("./ClaimAuthorizationHandler.js");
const OwnershipAuthorizationHandler_js_1 = require("./OwnershipAuthorizationHandler.js");
const AuthorizationEvaluator_js_1 = require("./AuthorizationEvaluator.js");
const PermissionCache_js_1 = require("./PermissionCache.js");
const PermissionProvider_js_1 = require("./PermissionProvider.js");
const PermissionCacheInvalidator_js_1 = require("./PermissionCacheInvalidator.js");
const AuthorizationGuard_js_1 = require("./AuthorizationGuard.js");
const ComponentAuthorizationGuard_js_1 = require("./ComponentAuthorizationGuard.js");
const AuthorizationEventDispatcher_js_1 = require("./AuthorizationEventDispatcher.js");
const AuthorizationObserver_js_1 = require("./AuthorizationObserver.js");
/**
 * AuthorizationFactory composing evaluators, handlers, and invalidators lifecycles.
 */
class AuthorizationFactory {
    static createPolicyRegistry() {
        return new PolicyRegistry_js_1.PolicyRegistry();
    }
    static createEvaluator() {
        const handlers = [
            new RoleAuthorizationHandler_js_1.RoleAuthorizationHandler(),
            new PermissionAuthorizationHandler_js_1.PermissionAuthorizationHandler(),
            new ClaimAuthorizationHandler_js_1.ClaimAuthorizationHandler(),
            new OwnershipAuthorizationHandler_js_1.OwnershipAuthorizationHandler()
        ];
        return new AuthorizationEvaluator_js_1.AuthorizationEvaluator(handlers);
    }
    static createPermissionCache() {
        return new PermissionCache_js_1.PermissionCache();
    }
    static createPermissionProvider(cache) {
        return new PermissionProvider_js_1.PermissionProvider(cache);
    }
    static createPermissionCacheInvalidator(cache, authObserver) {
        return new PermissionCacheInvalidator_js_1.PermissionCacheInvalidator(cache, authObserver);
    }
    static createGuard(evaluator, registry, getUserPrincipal) {
        return new AuthorizationGuard_js_1.AuthorizationGuard(evaluator, registry, getUserPrincipal);
    }
    static createComponentGuard(evaluator, registry) {
        return new ComponentAuthorizationGuard_js_1.ComponentAuthorizationGuard(evaluator, registry);
    }
    static createEventDispatcher() {
        return new AuthorizationEventDispatcher_js_1.AuthorizationEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new AuthorizationObserver_js_1.AuthorizationObserver(dispatcher);
    }
}
exports.AuthorizationFactory = AuthorizationFactory;
