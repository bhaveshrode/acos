import { Auth0Adapter } from "./Auth0Adapter.js";
import { ClerkAdapter } from "./ClerkAdapter.js";
import { IExternalIdentityProvider } from "./IExternalIdentityProvider.js";

/**
 * IdentityIntegrationFactory constructing identity adapters.
 */
export class IdentityIntegrationFactory {
  public static createAuth0Adapter(): IExternalIdentityProvider {
    return new Auth0Adapter();
  }

  public static createClerkAdapter(): IExternalIdentityProvider {
    return new ClerkAdapter();
  }

  public createAuth0Adapter(): IExternalIdentityProvider {
    return IdentityIntegrationFactory.createAuth0Adapter();
  }

  public createClerkAdapter(): IExternalIdentityProvider {
    return IdentityIntegrationFactory.createClerkAdapter();
  }
}
