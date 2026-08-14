import { IBlockchainProvider } from "./IBlockchainProvider.js";

/**
 * CircleAdapter adapting external Circle SDK APIs.
 */
export class CircleAdapter implements IBlockchainProvider {
  public async createWallet(userId: string): Promise<string> {
    return `circle_wallet_${userId}`;
  }

  public async broadcastTransaction(txHex: string): Promise<string> {
    return `circle_tx_${txHex.substring(0, 10)}`;
  }

  public async getTransactionStatus(txHash: string): Promise<string> {
    return txHash.startsWith("circle_tx_") ? "Confirmed" : "Unknown";
  }
}
