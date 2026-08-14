"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationStore = void 0;
/**
 * ConfigurationStore holding the immutable resolved frontend configuration snapshot.
 */
class ConfigurationStore {
    static instance = null;
    static set(config) {
        this.instance = Object.freeze({ ...config });
    }
    static get() {
        if (!this.instance) {
            throw new Error("Frontend Configuration has not been resolved and stored");
        }
        return this.instance;
    }
    static clear() {
        this.instance = null;
    }
}
exports.ConfigurationStore = ConfigurationStore;
