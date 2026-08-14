import { QuickBooksAdapter } from "./QuickBooksAdapter.js";
import { XeroAdapter } from "./XeroAdapter.js";
import { IAccountingProvider } from "./IAccountingProvider.js";

/**
 * AccountingFactory constructing accounting adapters.
 */
export class AccountingFactory {
  public static createQuickBooksAdapter(): IAccountingProvider {
    return new QuickBooksAdapter();
  }

  public static createXeroAdapter(): IAccountingProvider {
    return new XeroAdapter();
  }

  public createQuickBooksAdapter(): IAccountingProvider {
    return AccountingFactory.createQuickBooksAdapter();
  }

  public createXeroAdapter(): IAccountingProvider {
    return AccountingFactory.createXeroAdapter();
  }
}
