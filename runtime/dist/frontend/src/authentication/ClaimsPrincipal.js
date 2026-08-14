"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsPrincipal = void 0;
/**
 * ClaimsPrincipal holding claims records and verifying claim presence.
 */
class ClaimsPrincipal {
    userId;
    claims;
    constructor(userId, claims = {}) {
        this.userId = userId;
        this.claims = claims;
        Object.freeze(this.claims);
        Object.freeze(this);
    }
    hasClaim(type, value) {
        if (!(type in this.claims))
            return false;
        if (value === undefined)
            return true;
        return this.claims[type] === value;
    }
    getClaim(type) {
        return this.claims[type];
    }
}
exports.ClaimsPrincipal = ClaimsPrincipal;
