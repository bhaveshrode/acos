import { IWalletProvider, WalletBalance } from "../../../foundation/contracts/payment/IWalletProvider.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Mock wallet provider simulating cryptocurrency address generation, balance checks, and EVM transfers.
 */
export class MockWalletProvider implements IWalletProvider {
  public async getBalance(address: string, asset: string): Promise<Result<WalletBalance>> {
    return Result.ok({ asset, balance: 100.0 });
  }

  public async generateDepositAddress(userId: string, asset: string): Promise<Result<string>> {
    const address = "0x" + Math.random().toString(16).substring(2, 42).padEnd(40, "0");
    return Result.ok(address);
  }

  public async transfer(
    fromAddress: string,
    toAddress: string,
    amount: number,
    asset: string
  ): Promise<Result<string>> {
    const hash = "0x" + Math.random().toString(16).substring(2, 66).padEnd(64, "0");
    return Result.ok(hash);
  }
}
