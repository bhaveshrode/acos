import { IBlockchainProvider } from "../blockchain/IBlockchainProvider.js";

/**
 * BlockchainProviderRegistry cataloging blockchain providers.
 */
export class BlockchainProviderRegistry {
  private readonly providers = new Map<string, IBlockchainProvider>();

  public register(name: string, provider: IBlockchainProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }

  public resolve(name: string): IBlockchainProvider {
    const p = this.providers.get(name.toLowerCase());
    if (!p) {
      throw new Error(`Blockchain provider not found: ${name}`);
    }
    return p;
  }
}
