import { Result } from "../../result/Result.js";

/**
 * Interface representing foreign exchange rate quote services.
 */
export interface IExchangeRateProvider {
  /**
   * Retrieves the conversion multiplier between two currencies.
   * @param fromCurrency Source currency code (e.g. 'USD').
   * @param toCurrency Target currency code (e.g. 'EUR').
   */
  getRate(fromCurrency: string, toCurrency: string): Promise<Result<number>>;
}
