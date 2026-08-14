"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationValidator = void 0;
/**
 * ConfigurationValidator validating configuration fields rules and constraints.
 */
class ConfigurationValidator {
    validate(config) {
        if (!config.api.baseUrl) {
            throw new Error("Invalid configuration: API base URL is required");
        }
        if (!config.ws.url) {
            throw new Error("Invalid configuration: WebSocket URL is required");
        }
    }
}
exports.ConfigurationValidator = ConfigurationValidator;
