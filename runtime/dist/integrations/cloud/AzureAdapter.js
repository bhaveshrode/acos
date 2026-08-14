"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureAdapter = void 0;
/**
 * AzureAdapter adapting Azure Blob Storage and Key Vault services.
 */
class AzureAdapter {
    secrets = new Map();
    async storeSecret(key, secret) {
        this.secrets.set(key, secret);
    }
    async getSecret(key) {
        return this.secrets.get(key);
    }
    async uploadObject(bucketName, objectKey, content) {
        return `https://${bucketName}.blob.core.windows.net/${objectKey}`;
    }
}
exports.AzureAdapter = AzureAdapter;
