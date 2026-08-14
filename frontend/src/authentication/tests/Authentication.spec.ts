import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserSession } from "../UserSession.js";
import { AuthenticationState } from "../AuthenticationState.js";
import { AuthenticationOptions } from "../AuthenticationOptions.js";
import { AuthenticationContext } from "../AuthenticationContext.js";
import { JwtAuthenticationProvider } from "../JwtAuthenticationProvider.js";
import { ApiKeyAuthenticationProvider } from "../ApiKeyAuthenticationProvider.js";
import { AuthenticationProviderRegistry } from "../AuthenticationProviderRegistry.js";
import { MemorySessionStore } from "../MemorySessionStore.js";
import { LocalStorageSessionStore } from "../LocalStorageSessionStore.js";
import { SessionManager } from "../SessionManager.js";
import { SessionHydrator } from "../SessionHydrator.js";
import { CredentialValidator } from "../CredentialValidator.js";
import { SessionValidator } from "../SessionValidator.js";
import { AuthenticationService } from "../AuthenticationService.js";
import { ClaimsPrincipal } from "../ClaimsPrincipal.js";
import { ClaimsMapper } from "../ClaimsMapper.js";
import { PermissionResolver } from "../PermissionResolver.js";
import { AuthenticationEvent } from "../AuthenticationEvent.js";
import { AuthenticationEventDispatcher } from "../AuthenticationEventDispatcher.js";
import { AuthenticationObserver } from "../AuthenticationObserver.js";
import { AuthenticationFactory } from "../AuthenticationFactory.js";

describe("Frontend Authentication Component Unit Tests (Task 67.8)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  describe("Contexts & Models", () => {
    it("should instatiate session and evaluate expiration times", () => {
      const session = new UserSession(
        "u-1",
        "alice",
        "tok-1",
        { role: "user" },
        Date.now() - 1000 // Expired 1s ago
      );

      expect(session.isExpired()).toBe(true);
      expect(Object.isFrozen(session)).toBe(true);
      expect(Object.isFrozen(session.claims)).toBe(true);
    });

    it("should instantiate AuthenticationContext immutably", () => {
      const options: AuthenticationOptions = { rememberMe: true };
      const ctx = new AuthenticationContext(AuthenticationState.Unauthenticated, options);

      expect(ctx.state).toBe(AuthenticationState.Unauthenticated);
      expect(Object.isFrozen(ctx)).toBe(true);
    });
  });

  describe("Identity Providers & Registry", () => {
    it("should authenticate via JwtAuthenticationProvider calling mock IdentityApi", async () => {
      const mockIdentityApi = {
        login: async (credentials: any) => {
          if (credentials.password === "secret") {
            return {
              data: {
                token: "header.payload.signature",
                userId: "u-123",
                claims: { role: "admin" },
                expiresInSeconds: 30
              }
            };
          }
          throw new Error("Invalid password");
        }
      } as any;

      const provider = new JwtAuthenticationProvider(mockIdentityApi);
      const res = await provider.authenticate({ username: "alice", password: "secret" });

      expect(res.success).toBe(true);
      expect(res.session?.userId).toBe("u-123");
      expect(res.session?.token).toBe("header.payload.signature");

      const resFail = await provider.authenticate({ username: "alice", password: "wrong" });
      expect(resFail.success).toBe(false);
      expect(resFail.error).toContain("Invalid password");
    });

    it("should authenticate via ApiKeyAuthenticationProvider", async () => {
      const provider = new ApiKeyAuthenticationProvider();
      const res = await provider.authenticate({ apiKey: "key-123" });

      expect(res.success).toBe(true);
      expect(res.session?.userId).toBe("service-id");
      expect(res.session?.claims.role).toBe("service");
    });

    it("should register providers and freeze registry on startup", () => {
      const registry = new AuthenticationProviderRegistry();
      const provider = new ApiKeyAuthenticationProvider();
      registry.register("apikey", provider);

      expect(registry.getProvider("apikey")).toBe(provider);
      registry.freeze();

      expect(() => registry.register("jwt", provider)).toThrow(
        "AuthenticationProviderRegistry is frozen and cannot accept further providers"
      );
    });
  });

  describe("Session Management", () => {
    it("should save, load, and clear sessions in LocalStorageSessionStore", () => {
      const mockStorage: Record<string, string> = {};
      (globalThis as any).localStorage = {
        setItem: (key: string, val: string) => { mockStorage[key] = val; },
        getItem: (key: string) => mockStorage[key] || null,
        removeItem: (key: string) => { delete mockStorage[key]; }
      } as any;

      const store = new LocalStorageSessionStore();
      const session = new UserSession("u-1", "alice", "tok-123", { r: "admin" }, Date.now() + 1000);
      
      store.save("sess_key", session);
      expect(mockStorage.sess_key).toContain("tok-123");

      const loaded = store.load("sess_key");
      expect(loaded?.userId).toBe("u-1");
      expect(loaded?.token).toBe("tok-123");

      store.clear("sess_key");
      expect(mockStorage.sess_key).toBeUndefined();

      delete (globalThis as any).localStorage;
    });

    it("should hydrate managers from stored session in SessionHydrator", () => {
      const store = new MemorySessionStore();
      const options: AuthenticationOptions = { rememberMe: true, storageKey: "sess" };
      const manager = new SessionManager(store, options);
      const hydrator = new SessionHydrator(store);

      const session = new UserSession("u-2", "bob", "tok-bob", {}, Date.now() + 100000);
      store.save("sess", session);

      const success = hydrator.hydrate("sess", manager);
      expect(success).toBe(true);
      expect(manager.getContext().state).toBe(AuthenticationState.Authenticated);
      expect(manager.getContext().session?.username).toBe("bob");
    });
  });

  describe("Pipeline Validation & Authentication Service", () => {
    it("should run login and logout flows via AuthenticationService", async () => {
      const registry = new AuthenticationProviderRegistry();
      const mockProvider = {
        authenticate: async (creds: any) => {
          return { success: true, session: new UserSession("u-1", creds.username, "token-1") };
        }
      };
      registry.register("mock", mockProvider);

      const store = new MemorySessionStore();
      const manager = new SessionManager(store, { rememberMe: false });
      const credVal = new CredentialValidator();
      const sessVal = new SessionValidator();
      const service = new AuthenticationService(registry, manager, credVal, sessVal);

      const res = await service.login("mock", { username: "alice", password: "password" });
      expect(res.success).toBe(true);
      expect(manager.getContext().state).toBe(AuthenticationState.Authenticated);

      service.logout();
      expect(manager.getContext().state).toBe(AuthenticationState.Unauthenticated);
    });
  });

  describe("Claims & Permissions", () => {
    it("should decode mock JWT segments in ClaimsMapper", () => {
      // Decode simulated base64 payload segment
      const payload = { sub: "alice-id", role: "Manager", name: "Alice" };
      const base64Payload = btoa(JSON.stringify(payload));
      const mockToken = `header.${base64Payload}.signature`;

      const principal = ClaimsMapper.mapFromToken(mockToken);
      expect(principal.userId).toBe("alice-id");
      expect(principal.getClaim("name")).toBe("Alice");
      expect(principal.hasClaim("role", "Manager")).toBe(true);
    });

    it("should resolve permissions using PermissionResolver matching wildcards", () => {
      const p1 = new ClaimsPrincipal("u-1", { role: "Manager" });
      expect(PermissionResolver.resolvePermissions(p1)).toContain("write:customer");
      expect(PermissionResolver.hasPermission(p1, "write:customer")).toBe(true);
      expect(PermissionResolver.hasPermission(p1, "read:invoice")).toBe(true); // matches read:*
      expect(PermissionResolver.hasPermission(p1, "delete:customer")).toBe(false);

      const p2 = new ClaimsPrincipal("u-2", { role: "Admin" });
      expect(PermissionResolver.hasPermission(p2, "delete:customer")).toBe(true); // matches *
    });
  });

  describe("Events & Observers", () => {
    it("should publish authentication events to subscribers returning SubscriptionTokens", () => {
      const dispatcher = new AuthenticationEventDispatcher();
      const observer = new AuthenticationObserver(dispatcher);

      let triggered = false;
      let eventType = "";

      const token = observer.observe((ev) => {
        triggered = true;
        eventType = ev.type;
      });

      dispatcher.dispatch(new AuthenticationEvent("login"));
      expect(triggered).toBe(true);
      expect(eventType).toBe("login");

      triggered = false;
      token.dispose();

      dispatcher.dispatch(new AuthenticationEvent("logout"));
      expect(triggered).toBe(false); // Disposed, callback not called
    });
  });
});
