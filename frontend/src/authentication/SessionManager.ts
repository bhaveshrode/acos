import { ISessionStore } from "./ISessionStore.js";
import { UserSession } from "./UserSession.js";
import { AuthenticationContext } from "./AuthenticationContext.js";
import { AuthenticationState } from "./AuthenticationState.js";
import { AuthenticationOptions } from "./AuthenticationOptions.js";

/**
 * SessionManager coordinating active logins, logouts, state notifications, and token refresh thresholds.
 */
export class SessionManager {
  private context: AuthenticationContext;
  private readonly listeners = new Set<(ctx: AuthenticationContext) => void>();

  constructor(
    private readonly sessionStore: ISessionStore,
    private readonly options: AuthenticationOptions
  ) {
    this.context = new AuthenticationContext(AuthenticationState.Unauthenticated, options);
  }

  public getContext(): AuthenticationContext {
    return this.context;
  }

  public setSession(session: UserSession): void {
    this.context = new AuthenticationContext(AuthenticationState.Authenticated, this.options, session);
    if (this.options.rememberMe && this.options.storageKey) {
      this.sessionStore.save(this.options.storageKey, session);
    }
    this.notify();
  }

  public clearSession(): void {
    this.context = new AuthenticationContext(AuthenticationState.Unauthenticated, this.options);
    if (this.options.storageKey) {
      this.sessionStore.clear(this.options.storageKey);
    }
    this.notify();
  }

  public setRefreshing(): void {
    this.context = new AuthenticationContext(AuthenticationState.Refreshing, this.options, this.context.session);
    this.notify();
  }

  public setExpired(): void {
    this.context = new AuthenticationContext(AuthenticationState.Expired, this.options, this.context.session);
    this.notify();
  }

  public subscribe(listener: (ctx: AuthenticationContext) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.context);
    }
  }
}
