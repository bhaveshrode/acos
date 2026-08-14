"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationResolver = void 0;
const ConfigurationStore_js_1 = require("./ConfigurationStore.js");
/**
 * ConfigurationResolver applying defaults to configuration properties, running validations, and saving the immutable snapshot.
 */
class ConfigurationResolver {
    loader;
    validator;
    defaultValues = {
        api: {
            baseUrl: "http://localhost:3000/api",
            timeoutMs: 5000
        },
        ws: {
            url: "ws://localhost:3000/ws",
            reconnectIntervalMs: 3000
        },
        features: {
            enableNotifications: true,
            enableAnalytics: true
        },
        theme: {
            defaultMode: "dark"
        }
    };
    constructor(loader, validator) {
        this.loader = loader;
        this.validator = validator;
    }
    resolve() {
        const rawData = this.loader.load();
        const resolved = this.deepMerge(this.defaultValues, rawData);
        this.validator.validate(resolved);
        ConfigurationStore_js_1.ConfigurationStore.set(resolved);
        return resolved;
    }
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (target && typeof target === "object" && source && typeof source === "object") {
            Object.keys(source).forEach((key) => {
                if (source[key] && typeof source[key] === "object") {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    }
                    else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                }
                else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }
}
exports.ConfigurationResolver = ConfigurationResolver;
