"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationFactory = void 0;
const AuthenticationProviderRegistry_js_1 = require("./AuthenticationProviderRegistry.js");
const JwtAuthenticationProvider_js_1 = require("./JwtAuthenticationProvider.js");
const ApiKeyAuthenticationProvider_js_1 = require("./ApiKeyAuthenticationProvider.js");
const MemorySessionStore_js_1 = require("./MemorySessionStore.js");
const LocalStorageSessionStore_js_1 = require("./LocalStorageSessionStore.js");
const SessionManager_js_1 = require("./SessionManager.js");
const SessionHydrator_js_1 = require("./SessionHydrator.js");
const CredentialValidator_js_1 = require("./CredentialValidator.js");
const SessionValidator_js_1 = require("./SessionValidator.js");
const AuthenticationService_js_1 = require("./AuthenticationService.js");
const AuthenticationEventDispatcher_js_1 = require("./AuthenticationEventDispatcher.js");
const AuthenticationObserver_js_1 = require("./AuthenticationObserver.js");
/**
 * AuthenticationFactory composing authentication contexts, validators, and managers lifecycles.
 */
class AuthenticationFactory {
    static createRegistry() {
        return new AuthenticationProviderRegistry_js_1.AuthenticationProviderRegistry();
    }
    static createJwtProvider(identityApi) {
        return new JwtAuthenticationProvider_js_1.JwtAuthenticationProvider(identityApi);
    }
    static createApiKeyProvider() {
        return new ApiKeyAuthenticationProvider_js_1.ApiKeyAuthenticationProvider();
    }
    static createMemorySessionStore() {
        return new MemorySessionStore_js_1.MemorySessionStore();
    }
    static createLocalStorageSessionStore() {
        return new LocalStorageSessionStore_js_1.LocalStorageSessionStore();
    }
    static createSessionManager(store, options) {
        return new SessionManager_js_1.SessionManager(store, options);
    }
    static createSessionHydrator(store) {
        return new SessionHydrator_js_1.SessionHydrator(store);
    }
    static createCredentialValidator() {
        return new CredentialValidator_js_1.CredentialValidator();
    }
    static createSessionValidator() {
        return new SessionValidator_js_1.SessionValidator();
    }
    static createService(registry, sessionManager, credentialValidator, sessionValidator) {
        return new AuthenticationService_js_1.AuthenticationService(registry, sessionManager, credentialValidator, sessionValidator);
    }
    static createEventDispatcher() {
        return new AuthenticationEventDispatcher_js_1.AuthenticationEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new AuthenticationObserver_js_1.AuthenticationObserver(dispatcher);
    }
}
exports.AuthenticationFactory = AuthenticationFactory;
