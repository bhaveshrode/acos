"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityIntegrationFactory = void 0;
const Auth0Adapter_js_1 = require("./Auth0Adapter.js");
const ClerkAdapter_js_1 = require("./ClerkAdapter.js");
/**
 * IdentityIntegrationFactory constructing identity adapters.
 */
class IdentityIntegrationFactory {
    static createAuth0Adapter() {
        return new Auth0Adapter_js_1.Auth0Adapter();
    }
    static createClerkAdapter() {
        return new ClerkAdapter_js_1.ClerkAdapter();
    }
    createAuth0Adapter() {
        return IdentityIntegrationFactory.createAuth0Adapter();
    }
    createClerkAdapter() {
        return IdentityIntegrationFactory.createClerkAdapter();
    }
}
exports.IdentityIntegrationFactory = IdentityIntegrationFactory;
