"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainProviderRegistry = void 0;
/**
 * BlockchainProviderRegistry cataloging blockchain providers.
 */
class BlockchainProviderRegistry {
    providers = new Map();
    register(name, provider) {
        this.providers.set(name.toLowerCase(), provider);
    }
    resolve(name) {
        const p = this.providers.get(name.toLowerCase());
        if (!p) {
            throw new Error(`Blockchain provider not found: ${name}`);
        }
        return p;
    }
}
exports.BlockchainProviderRegistry = BlockchainProviderRegistry;
