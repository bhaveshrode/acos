"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSSecretsProvider = void 0;
/**
 * AWSSecretsProvider implementing ISecretProvider using AWS Secrets Manager.
 */
class AWSSecretsProvider {
    store = new Map();
    async getSecret(id) {
        return this.store.get(id);
    }
    async storeSecret(secret) {
        this.store.set(secret.id, secret);
    }
}
exports.AWSSecretsProvider = AWSSecretsProvider;
