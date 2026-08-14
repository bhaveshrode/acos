"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendConfigurationFactory = void 0;
const ConfigurationBuilder_js_1 = require("./ConfigurationBuilder.js");
const ConfigurationResolver_js_1 = require("./ConfigurationResolver.js");
const ConfigurationValidator_js_1 = require("./ConfigurationValidator.js");
const FrontendConfigurationProvider_js_1 = require("./FrontendConfigurationProvider.js");
/**
 * FrontendConfigurationFactory constructing builders, resolvers, validators, and providers.
 */
class FrontendConfigurationFactory {
    static createBuilder() {
        return new ConfigurationBuilder_js_1.ConfigurationBuilder();
    }
    static createResolver(loader, validator) {
        return new ConfigurationResolver_js_1.ConfigurationResolver(loader, validator);
    }
    static createValidator() {
        return new ConfigurationValidator_js_1.ConfigurationValidator();
    }
    static createProvider() {
        return new FrontendConfigurationProvider_js_1.FrontendConfigurationProvider();
    }
}
exports.FrontendConfigurationFactory = FrontendConfigurationFactory;
