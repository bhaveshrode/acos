"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationConfiguration = void 0;
/**
 * AuthenticationConfiguration containing auth types and secrets.
 */
class AuthenticationConfiguration {
    authType;
    credentials;
    constructor(authType, credentials = {}) {
        this.authType = authType;
        this.credentials = credentials;
        Object.freeze(this.credentials);
        Object.freeze(this);
    }
}
exports.AuthenticationConfiguration = AuthenticationConfiguration;
