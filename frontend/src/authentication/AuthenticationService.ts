import { AuthenticationProviderRegistry } from "./AuthenticationProviderRegistry.js";
import { SessionManager } from "./SessionManager.js";
import { CredentialValidator } from "./CredentialValidator.js";
import { SessionValidator } from "./SessionValidator.js";
import { AuthenticationResult } from "./AuthenticationResult.js";

/**
 * AuthenticationService coordinating validating credentials and provider pipelines updates.
 */
export class AuthenticationService {
  constructor(
    private readonly registry: AuthenticationProviderRegistry,
    private readonly sessionManager: SessionManager,
    private readonly credentialValidator: CredentialValidator,
    private readonly sessionValidator: SessionValidator
  ) {}

  public async login(providerName: string, credentials: any): Promise<AuthenticationResult> {
    const validationErrors = this.credentialValidator.validate(credentials);
    if (validationErrors.length > 0) {
      return AuthenticationResult.failed(validationErrors.join(", "));
    }

    const provider = this.registry.getProvider(providerName);
    if (!provider) {
      return AuthenticationResult.failed(`Identity provider ${providerName} is not registered`);
    }

    const result = await provider.authenticate(credentials);
    if (result.success && result.session) {
      this.sessionManager.setSession(result.session);
    }
    return result;
  }

  public logout(): void {
    this.sessionManager.clearSession();
  }

  public checkSession(): boolean {
    const ctx = this.sessionManager.getContext();
    const isValid = this.sessionValidator.validate(ctx.session);
    if (!isValid && ctx.session) {
      this.sessionManager.setExpired();
    }
    return isValid;
  }
}
