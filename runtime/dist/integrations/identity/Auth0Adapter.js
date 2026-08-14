"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth0Adapter = void 0;
/**
 * Auth0Adapter adapting external Auth0 SDK APIs.
 */
class Auth0Adapter {
    async validateToken(token) {
        return token.startsWith("auth0_");
    }
    async getUserDetails(token) {
        return { sub: "auth0-usr-90", provider: "auth0" };
    }
}
exports.Auth0Adapter = Auth0Adapter;
