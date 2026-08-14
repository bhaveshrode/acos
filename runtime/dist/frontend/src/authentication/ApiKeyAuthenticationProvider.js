"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyAuthenticationProvider = void 0;
const AuthenticationResult_js_1 = require("./AuthenticationResult.js");
const UserSession_js_1 = require("./UserSession.js");
/**
 * ApiKeyAuthenticationProvider supporting API key headers authentication checks.
 */
class ApiKeyAuthenticationProvider {
    async authenticate(credentials) {
        if (credentials && credentials.apiKey) {
            const session = new UserSession_js_1.UserSession("service-id", "service-principal", credentials.apiKey, { role: "service" }, Date.now() + 365 * 24 * 3600 * 1000);
            return AuthenticationResult_js_1.AuthenticationResult.success(session);
        }
        return AuthenticationResult_js_1.AuthenticationResult.failed("Api key credentials must contain apiKey field");
    }
}
exports.ApiKeyAuthenticationProvider = ApiKeyAuthenticationProvider;
