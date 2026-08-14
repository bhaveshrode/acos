"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationConfiguration = void 0;
/**
 * IntegrationConfiguration containing provider mappings.
 */
class IntegrationConfiguration {
    providerName;
    configData;
    constructor(providerName, configData = {}) {
        this.providerName = providerName;
        this.configData = configData;
        Object.freeze(this.configData);
        Object.freeze(this);
    }
}
exports.IntegrationConfiguration = IntegrationConfiguration;
