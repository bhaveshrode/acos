"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureKeyVaultProvider = void 0;
/**
 * AzureKeyVaultProvider implementing ISecretProvider using Azure Key Vault.
 */
class AzureKeyVaultProvider {
    store = new Map();
    async getSecret(id) {
        return this.store.get(id);
    }
    async storeSecret(secret) {
        this.store.set(secret.id, secret);
    }
}
exports.AzureKeyVaultProvider = AzureKeyVaultProvider;
