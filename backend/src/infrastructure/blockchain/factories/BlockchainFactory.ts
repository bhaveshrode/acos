import { MockWalletProvider } from "../providers/MockWalletProvider.js";
import { MockSettlementProvider } from "../providers/MockSettlementProvider.js";
import { MockPaymentGateway } from "../providers/MockPaymentGateway.js";
import { MockExchangeRateProvider } from "../providers/MockExchangeRateProvider.js";
import { JsonRpcClient } from "../clients/JsonRpcClient.js";
import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";

/**
 * Factory class generating concrete/mock blockchain integrations.
 */
export class BlockchainFactory {
  /**
   * Instantiates MockWalletProvider.
   */
  public static createWalletProvider(config?: ConfigurationSnapshot): MockWalletProvider {
    return new MockWalletProvider();
  }

  /**
   * Instantiates MockSettlementProvider.
   */
  public static createSettlementProvider(config?: ConfigurationSnapshot): MockSettlementProvider {
    return new MockSettlementProvider();
  }

  /**
   * Instantiates MockPaymentGateway.
   */
  public static createPaymentGateway(config?: ConfigurationSnapshot): MockPaymentGateway {
    return new MockPaymentGateway();
  }

  /**
   * Instantiates MockExchangeRateProvider.
   */
  public static createExchangeRateProvider(config?: ConfigurationSnapshot): MockExchangeRateProvider {
    return new MockExchangeRateProvider();
  }

  /**
   * Instantiates simulated JsonRpcClient.
   */
  public static createRpcClient(config?: ConfigurationSnapshot): JsonRpcClient {
    const endpoint = "http://localhost:8545";
    return new JsonRpcClient(endpoint);
  }
}
