import { IBlockchainProvider } from "./IBlockchainProvider.js";

/**
 * FireblocksAdapter adapting external Fireblocks SDK APIs.
 */
export class FireblocksAdapter implements IBlockchainProvider {
  public async createWallet(userId: string): Promise<string> {
    return `fireblocks_wallet_${userId}`;
  }

  public async broadcastTransaction(txHex: string): Promise<string> {
    return `fireblocks_tx_${txHex.substring(0, 10)}`;
  }

  public async getTransactionStatus(txHash: string): Promise<string> {
    return txHash.startsWith("fireblocks_tx_") ? "Confirmed" : "Unknown";
  }
}
