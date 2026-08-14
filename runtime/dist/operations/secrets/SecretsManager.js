"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsManager = void 0;
/**
 * SecretsManager managing key retrievals delegating calls to providers.
 */
class SecretsManager {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    async storeSecret(secret) {
        await this.provider.storeSecret(secret);
    }
    async getSecret(id) {
        return await this.provider.getSecret(id);
    }
}
exports.SecretsManager = SecretsManager;
