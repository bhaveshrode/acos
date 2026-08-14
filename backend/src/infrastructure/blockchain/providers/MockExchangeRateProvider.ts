import { IExchangeRateProvider } from "../../../foundation/contracts/payment/IExchangeRateProvider.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Mock exchange rate provider simulating oracle quote updates.
 */
export class MockExchangeRateProvider implements IExchangeRateProvider {
  public async getRate(fromCurrency: string, toCurrency: string): Promise<Result<number>> {
    if (fromCurrency === toCurrency) {
      return Result.ok(1.0);
    }
    return Result.ok(1.15);
  }
}
