"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationInterceptor = void 0;
/**
 * AuthenticationInterceptor appending authorization credentials.
 */
class AuthenticationInterceptor {
    handler;
    constructor(handler) {
        this.handler = handler;
    }
    async interceptRequest(request) {
        return this.handler.attachToken(request);
    }
}
exports.AuthenticationInterceptor = AuthenticationInterceptor;
