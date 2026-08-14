"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationProviders = void 0;
/**
 * ApplicationProviders registering modular providers (Theme, Router, Auth, Socket) to context trees.
 */
class ApplicationProviders {
    providers = [];
    register(provider) {
        this.providers.push(provider);
    }
    async initializeAll(context) {
        for (const provider of this.providers) {
            await provider.init(context);
        }
    }
    getProviders() {
        return [...this.providers];
    }
}
exports.ApplicationProviders = ApplicationProviders;
