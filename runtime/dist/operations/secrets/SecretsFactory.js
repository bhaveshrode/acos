"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsFactory = void 0;
const SecretKey_js_1 = require("./SecretKey.js");
const VaultProvider_js_1 = require("./VaultProvider.js");
const EnvironmentProvider_js_1 = require("./EnvironmentProvider.js");
const AzureKeyVaultProvider_js_1 = require("./AzureKeyVaultProvider.js");
const AWSSecretsProvider_js_1 = require("./AWSSecretsProvider.js");
const SecretsManager_js_1 = require("./SecretsManager.js");
/**
 * SecretsFactory creating manager classes and encrypted keys.
 */
class SecretsFactory {
    static createKey(id, value, version) {
        return new SecretKey_js_1.SecretKey(id, value, version);
    }
    static createVaultProvider() {
        return new VaultProvider_js_1.VaultProvider();
    }
    static createEnvironmentProvider() {
        return new EnvironmentProvider_js_1.EnvironmentProvider();
    }
    static createAzureProvider() {
        return new AzureKeyVaultProvider_js_1.AzureKeyVaultProvider();
    }
    static createAWSProvider() {
        return new AWSSecretsProvider_js_1.AWSSecretsProvider();
    }
    static createManager(provider) {
        return new SecretsManager_js_1.SecretsManager(provider);
    }
    createKey(id, value, version) {
        return SecretsFactory.createKey(id, value, version);
    }
    createVaultProvider() {
        return SecretsFactory.createVaultProvider();
    }
    createEnvironmentProvider() {
        return SecretsFactory.createEnvironmentProvider();
    }
    createAzureProvider() {
        return SecretsFactory.createAzureProvider();
    }
    createAWSProvider() {
        return SecretsFactory.createAWSProvider();
    }
    createManager(provider) {
        return SecretsFactory.createManager(provider);
    }
}
exports.SecretsFactory = SecretsFactory;
