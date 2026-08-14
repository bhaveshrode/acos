"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircleAdapter = void 0;
/**
 * CircleAdapter adapting external Circle SDK APIs.
 */
class CircleAdapter {
    async createWallet(userId) {
        return `circle_wallet_${userId}`;
    }
    async broadcastTransaction(txHex) {
        return `circle_tx_${txHex.substring(0, 10)}`;
    }
    async getTransactionStatus(txHash) {
        return txHash.startsWith("circle_tx_") ? "Confirmed" : "Unknown";
    }
}
exports.CircleAdapter = CircleAdapter;
