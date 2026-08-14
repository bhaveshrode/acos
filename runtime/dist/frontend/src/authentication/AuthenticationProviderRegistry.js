"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationProviderRegistry = void 0;
/**
 * AuthenticationProviderRegistry cataloging all registered active authentication identity providers.
 */
class AuthenticationProviderRegistry {
    providers = new Map();
    isFrozen = false;
    register(name, provider) {
        if (this.isFrozen) {
            throw new Error("AuthenticationProviderRegistry is frozen and cannot accept further providers");
        }
        this.providers.set(name, provider);
    }
    getProvider(name) {
        return this.providers.get(name);
    }
    freeze() {
        this.isFrozen = true;
    }
}
exports.AuthenticationProviderRegistry = AuthenticationProviderRegistry;
