import { AuthenticationOptions } from "./AuthenticationOptions.js";
import { AuthenticationProviderRegistry } from "./AuthenticationProviderRegistry.js";
import { JwtAuthenticationProvider } from "./JwtAuthenticationProvider.js";
import { ApiKeyAuthenticationProvider } from "./ApiKeyAuthenticationProvider.js";
import { MemorySessionStore } from "./MemorySessionStore.js";
import { LocalStorageSessionStore } from "./LocalStorageSessionStore.js";
import { SessionManager } from "./SessionManager.js";
import { SessionHydrator } from "./SessionHydrator.js";
import { CredentialValidator } from "./CredentialValidator.js";
import { SessionValidator } from "./SessionValidator.js";
import { AuthenticationService } from "./AuthenticationService.js";
import { AuthenticationEventDispatcher } from "./AuthenticationEventDispatcher.js";
import { AuthenticationObserver } from "./AuthenticationObserver.js";
import { IdentityApi } from "../api/IdentityApi.js";

/**
 * AuthenticationFactory composing authentication contexts, validators, and managers lifecycles.
 */
export class AuthenticationFactory {
  public static createRegistry(): AuthenticationProviderRegistry {
    return new AuthenticationProviderRegistry();
  }

  public static createJwtProvider(identityApi: IdentityApi): JwtAuthenticationProvider {
    return new JwtAuthenticationProvider(identityApi);
  }

  public static createApiKeyProvider(): ApiKeyAuthenticationProvider {
    return new ApiKeyAuthenticationProvider();
  }

  public static createMemorySessionStore(): MemorySessionStore {
    return new MemorySessionStore();
  }

  public static createLocalStorageSessionStore(): LocalStorageSessionStore {
    return new LocalStorageSessionStore();
  }

  public static createSessionManager(store: any, options: AuthenticationOptions): SessionManager {
    return new SessionManager(store, options);
  }

  public static createSessionHydrator(store: any): SessionHydrator {
    return new SessionHydrator(store);
  }

  public static createCredentialValidator(): CredentialValidator {
    return new CredentialValidator();
  }

  public static createSessionValidator(): SessionValidator {
    return new SessionValidator();
  }

  public static createService(
    registry: AuthenticationProviderRegistry,
    sessionManager: SessionManager,
    credentialValidator: CredentialValidator,
    sessionValidator: SessionValidator
  ): AuthenticationService {
    return new AuthenticationService(registry, sessionManager, credentialValidator, sessionValidator);
  }

  public static createEventDispatcher(): AuthenticationEventDispatcher {
    return new AuthenticationEventDispatcher();
  }

  public static createObserver(dispatcher: AuthenticationEventDispatcher): AuthenticationObserver {
    return new AuthenticationObserver(dispatcher);
  }
}
