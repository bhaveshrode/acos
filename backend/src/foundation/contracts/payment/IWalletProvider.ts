import { Result } from "../../result/Result.js";

export interface WalletBalance {
  asset: string;
  balance: number;
}

/**
 * Interface representing cryptocurrency wallet ledger integration capabilities.
 */
export interface IWalletProvider {
  /**
   * Retrieves the balance of an asset on a specific address.
   */
  getBalance(address: string, asset: string): Promise<Result<WalletBalance>>;

  /**
   * Generates a unique cryptocurrency address for user deposits.
   */
  generateDepositAddress(userId: string, asset: string): Promise<Result<string>>;

  /**
   * Transfers a specified amount of tokens from one address to another.
   * Returns a successful Result containing the transaction hash/signature on success.
   */
  transfer(
    fromAddress: string,
    toAddress: string,
    amount: number,
    asset: string
  ): Promise<Result<string>>;
}
