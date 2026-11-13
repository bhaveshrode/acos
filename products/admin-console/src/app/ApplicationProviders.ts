import { IProvider } from "./IProvider.js";

/**
 * ApplicationProviders registering modular providers (Theme, Router, Auth, Socket) to context trees.
 */
export class ApplicationProviders {
  private readonly providers: IProvider[] = [];

  public register(provider: IProvider): void {
    this.providers.push(provider);
  }

  public async initializeAll(context: any): Promise<void> {
    for (const provider of this.providers) {
      await provider.init(context);
    }
  }

  public getProviders(): IProvider[] {
    return [...this.providers];
  }
}
