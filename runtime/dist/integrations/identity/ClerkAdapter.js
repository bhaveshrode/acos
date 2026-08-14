"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAdapter = void 0;
/**
 * ClerkAdapter adapting external Clerk SDK APIs.
 */
class ClerkAdapter {
    async validateToken(token) {
        return token.startsWith("clerk_");
    }
    async getUserDetails(token) {
        return { sub: "clerk-usr-80", provider: "clerk" };
    }
}
exports.ClerkAdapter = ClerkAdapter;
