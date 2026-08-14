"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentProvider = void 0;
/**
 * EnvironmentProvider implementing ISecretProvider using process env variables.
 */
class EnvironmentProvider {
    store = new Map();
    async getSecret(id) {
        return this.store.get(id);
    }
    async storeSecret(secret) {
        this.store.set(secret.id, secret);
    }
}
exports.EnvironmentProvider = EnvironmentProvider;
