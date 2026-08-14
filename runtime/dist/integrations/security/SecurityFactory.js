"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityFactory = void 0;
const IntegrationCredentials_js_1 = require("./IntegrationCredentials.js");
const TokenBucketLimiter_js_1 = require("./TokenBucketLimiter.js");
/**
 * SecurityFactory constructing credentials and rate limiters.
 */
class SecurityFactory {
    static createCredentials(clientId, clientSecret, tokenUrl) {
        return new IntegrationCredentials_js_1.IntegrationCredentials(clientId, clientSecret, tokenUrl);
    }
    static createRateLimiter(maxTokens, refillRate) {
        return new TokenBucketLimiter_js_1.TokenBucketLimiter(maxTokens, refillRate);
    }
    createCredentials(clientId, clientSecret, tokenUrl) {
        return SecurityFactory.createCredentials(clientId, clientSecret, tokenUrl);
    }
    createRateLimiter(maxTokens, refillRate) {
        return SecurityFactory.createRateLimiter(maxTokens, refillRate);
    }
}
exports.SecurityFactory = SecurityFactory;
