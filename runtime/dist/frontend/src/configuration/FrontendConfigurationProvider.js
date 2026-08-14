"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendConfigurationProvider = void 0;
const ConfigurationStore_js_1 = require("./ConfigurationStore.js");
/**
 * FrontendConfigurationProvider wrapping access to immutable cached snapshots.
 */
class FrontendConfigurationProvider {
    getConfiguration() {
        return ConfigurationStore_js_1.ConfigurationStore.get();
    }
}
exports.FrontendConfigurationProvider = FrontendConfigurationProvider;
