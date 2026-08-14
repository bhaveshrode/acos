"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSAdapter = void 0;
/**
 * AWSAdapter adapting AWS Secrets Manager and S3 services.
 */
class AWSAdapter {
    secrets = new Map();
    async storeSecret(key, secret) {
        this.secrets.set(key, secret);
    }
    async getSecret(key) {
        return this.secrets.get(key);
    }
    async uploadObject(bucketName, objectKey, content) {
        return `s3://${bucketName}/${objectKey}`;
    }
}
exports.AWSAdapter = AWSAdapter;
