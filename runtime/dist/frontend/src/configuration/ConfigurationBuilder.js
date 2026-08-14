"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationBuilder = void 0;
const CompositeConfigurationLoader_js_1 = require("./CompositeConfigurationLoader.js");
/**
 * ConfigurationBuilder assembling application configuration loaders.
 */
class ConfigurationBuilder {
    loaders = [];
    addLoader(loader) {
        this.loaders.push(loader);
        return this;
    }
    build() {
        return new CompositeConfigurationLoader_js_1.CompositeConfigurationLoader(this.loaders);
    }
}
exports.ConfigurationBuilder = ConfigurationBuilder;
