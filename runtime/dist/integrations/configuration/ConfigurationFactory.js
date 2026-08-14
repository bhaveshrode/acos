"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationFactory = void 0;
const IntegrationConfiguration_js_1 = require("./IntegrationConfiguration.js");
const AuthenticationConfiguration_js_1 = require("./AuthenticationConfiguration.js");
const EndpointConfiguration_js_1 = require("./EndpointConfiguration.js");
const RetryConfiguration_js_1 = require("./RetryConfiguration.js");
/**
 * ConfigurationFactory building provider, authentication, endpoint, and retry configurations.
 */
class ConfigurationFactory {
    static createConfig(providerName, configData) {
        return new IntegrationConfiguration_js_1.IntegrationConfiguration(providerName, configData);
    }
    static createAuthConfig(authType, credentials) {
        return new AuthenticationConfiguration_js_1.AuthenticationConfiguration(authType, credentials);
    }
    static createEndpointConfig(baseUrl, version) {
        return new EndpointConfiguration_js_1.EndpointConfiguration(baseUrl, version);
    }
    static createRetryConfig(maxRetries, backoffMs) {
        return new RetryConfiguration_js_1.RetryConfiguration(maxRetries, backoffMs);
    }
    createConfig(providerName, configData) {
        return ConfigurationFactory.createConfig(providerName, configData);
    }
    createAuthConfig(authType, credentials) {
        return ConfigurationFactory.createAuthConfig(authType, credentials);
    }
    createEndpointConfig(baseUrl, version) {
        return ConfigurationFactory.createEndpointConfig(baseUrl, version);
    }
    createRetryConfig(maxRetries, backoffMs) {
        return ConfigurationFactory.createRetryConfig(maxRetries, backoffMs);
    }
}
exports.ConfigurationFactory = ConfigurationFactory;
