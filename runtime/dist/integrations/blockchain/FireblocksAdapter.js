"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FireblocksAdapter = void 0;
/**
 * FireblocksAdapter adapting external Fireblocks SDK APIs.
 */
class FireblocksAdapter {
    async createWallet(userId) {
        return `fireblocks_wallet_${userId}`;
    }
    async broadcastTransaction(txHex) {
        return `fireblocks_tx_${txHex.substring(0, 10)}`;
    }
    async getTransactionStatus(txHash) {
        return txHash.startsWith("fireblocks_tx_") ? "Confirmed" : "Unknown";
    }
}
exports.FireblocksAdapter = FireblocksAdapter;
