"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultProvider = void 0;
/**
 * VaultProvider implementing ISecretProvider using HashiCorp Vault semantics.
 */
class VaultProvider {
    store = new Map();
    async getSecret(id) {
        return this.store.get(id);
    }
    async storeSecret(secret) {
        this.store.set(secret.id, secret);
    }
}
exports.VaultProvider = VaultProvider;
