/**
 * IBlockchainProvider declaring wallet creation and transaction broadcasting hooks.
 */
export interface IBlockchainProvider {
  createWallet(userId: string): Promise<string>;
  broadcastTransaction(txHex: string): Promise<string>;
  getTransactionStatus(txHash: string): Promise<string>;
}
