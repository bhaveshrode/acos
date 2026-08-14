"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationPolicy = void 0;
/**
 * AuthorizationPolicy bundling authorization requirements lists.
 */
class AuthorizationPolicy {
    name;
    requirements;
    constructor(name, requirements = []) {
        this.name = name;
        this.requirements = requirements;
        Object.freeze(this.requirements);
        Object.freeze(this);
    }
}
exports.AuthorizationPolicy = AuthorizationPolicy;
