"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSession = void 0;
/**
 * UserSession representing authenticated credentials, claims, and token metadata.
 */
class UserSession {
    userId;
    username;
    token;
    claims;
    expirationTime;
    refreshToken;
    constructor(userId, username, token, claims = {}, expirationTime = 0, refreshToken) {
        this.userId = userId;
        this.username = username;
        this.token = token;
        this.claims = claims;
        this.expirationTime = expirationTime;
        this.refreshToken = refreshToken;
        Object.freeze(this.claims);
        Object.freeze(this);
    }
    isExpired(currentTimeMs = Date.now()) {
        return this.expirationTime > 0 && currentTimeMs >= this.expirationTime;
    }
}
exports.UserSession = UserSession;
