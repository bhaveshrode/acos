"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeConfigurationLoader = void 0;
/**
 * CompositeConfigurationLoader merging multiple loaders config inputs.
 */
class CompositeConfigurationLoader {
    loaders;
    constructor(loaders) {
        this.loaders = loaders;
    }
    load() {
        let merged = {};
        for (const loader of this.loaders) {
            const data = loader.load();
            merged = this.deepMerge(merged, data);
        }
        return merged;
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
exports.CompositeConfigurationLoader = CompositeConfigurationLoader;
