"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthenticationProvider = void 0;
const AuthenticationResult_js_1 = require("./AuthenticationResult.js");
const UserSession_js_1 = require("./UserSession.js");
/**
 * JwtAuthenticationProvider authenticating users using JWT tokens via REST APIs.
 */
class JwtAuthenticationProvider {
    identityApi;
    constructor(identityApi) {
        this.identityApi = identityApi;
    }
    async authenticate(credentials) {
        try {
            const response = await this.identityApi.login(credentials);
            const data = response.data;
            if (data && data.token) {
                const claims = data.claims || {};
                const expirationTime = Date.now() + (data.expiresInSeconds || 3600) * 1000;
                const session = new UserSession_js_1.UserSession(data.userId || "user-id", credentials.username || "user", data.token, claims, expirationTime, data.refreshToken);
                return AuthenticationResult_js_1.AuthenticationResult.success(session);
            }
            return AuthenticationResult_js_1.AuthenticationResult.failed("No token returned from login response");
        }
        catch (err) {
            return AuthenticationResult_js_1.AuthenticationResult.failed(err.message || "JWT Authentication failed");
        }
    }
}
exports.JwtAuthenticationProvider = JwtAuthenticationProvider;
