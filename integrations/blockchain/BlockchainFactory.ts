import { CircleAdapter } from "./CircleAdapter.js";
import { FireblocksAdapter } from "./FireblocksAdapter.js";
import { IBlockchainProvider } from "./IBlockchainProvider.js";
import { BlockchainProviderRegistry } from "../registries/BlockchainProviderRegistry.js";

/**
 * BlockchainFactory constructing blockchain providers and registries.
 */
export class BlockchainFactory {
  public static createRegistry(): BlockchainProviderRegistry {
    return new BlockchainProviderRegistry();
  }

  public static createCircleAdapter(): IBlockchainProvider {
    return new CircleAdapter();
  }

  public static createFireblocksAdapter(): IBlockchainProvider {
    return new FireblocksAdapter();
  }

  public createRegistry(): BlockchainProviderRegistry {
    return BlockchainFactory.createRegistry();
  }

  public createCircleAdapter(): IBlockchainProvider {
    return BlockchainFactory.createCircleAdapter();
  }

  public createFireblocksAdapter(): IBlockchainProvider {
    return BlockchainFactory.createFireblocksAdapter();
  }
}
