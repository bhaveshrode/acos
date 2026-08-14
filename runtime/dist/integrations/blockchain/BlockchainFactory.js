"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainFactory = void 0;
const CircleAdapter_js_1 = require("./CircleAdapter.js");
const FireblocksAdapter_js_1 = require("./FireblocksAdapter.js");
const BlockchainProviderRegistry_js_1 = require("../registries/BlockchainProviderRegistry.js");
/**
 * BlockchainFactory constructing blockchain providers and registries.
 */
class BlockchainFactory {
    static createRegistry() {
        return new BlockchainProviderRegistry_js_1.BlockchainProviderRegistry();
    }
    static createCircleAdapter() {
        return new CircleAdapter_js_1.CircleAdapter();
    }
    static createFireblocksAdapter() {
        return new FireblocksAdapter_js_1.FireblocksAdapter();
    }
    createRegistry() {
        return BlockchainFactory.createRegistry();
    }
    createCircleAdapter() {
        return BlockchainFactory.createCircleAdapter();
    }
    createFireblocksAdapter() {
        return BlockchainFactory.createFireblocksAdapter();
    }
}
exports.BlockchainFactory = BlockchainFactory;
