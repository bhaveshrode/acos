import { describe, it, expect, beforeEach } from "vitest";
import { AuthenticationContext } from "../AuthenticationContext.js";
import { AuthenticationException } from "../AuthenticationException.js";
import { JwtTokenProvider } from "../JwtTokenProvider.js";
import { RefreshTokenProvider } from "../RefreshTokenProvider.js";
import { TokenValidator } from "../TokenValidator.js";
import { ClaimsPrincipalBuilder } from "../ClaimsPrincipalBuilder.js";
import { ClaimsMapper } from "../ClaimsMapper.js";
import { AuthenticationService } from "../AuthenticationService.js";
import { SessionManager } from "../SessionManager.js";
import { PasswordHasher } from "../PasswordHasher.js";
import { ApiKeyAuthenticator } from "../ApiKeyAuthenticator.js";
import { AuthenticationPolicy } from "../AuthenticationPolicy.js";
import { AuthenticationRegistry } from "../AuthenticationRegistry.js";
import { AuthenticationFactory } from "../AuthenticationFactory.js";

describe("Presentation Authentication Component Tests (Task 42.8)", () => {
  const secret = "acos-secret-key-123456789-super-long-required-signing-key";

  beforeEach(() => {
    AuthenticationRegistry.clear();
  });

  describe("JwtTokenProvider & Cryptographic assertions", () => {
    it("should generate and verify HMAC SHA-256 JWT tokens", () => {
      const provider = new JwtTokenProvider(secret);
      const token = provider.generateToken({ sub: "user-99", role: "admin", orgId: "org-1" }, 15);

      expect(token).toBeDefined();
      expect(token.split(".").length).toBe(3);

      const claims = provider.verifyToken(token);
      expect(claims.sub).toBe("user-99");
      expect(claims.role).toBe("admin");
      expect(claims.orgId).toBe("org-1");
      expect(claims.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it("should reject token signatures signed with incorrect secret key", () => {
      const provider1 = new JwtTokenProvider(secret);
      const provider2 = new JwtTokenProvider("wrong-secret-key");
      const token = provider1.generateToken({ sub: "user-99" }, 15);

      expect(() => {
        provider2.verifyToken(token);
      }).toThrow("Invalid signature");
    });

    it("should reject expired tokens", () => {
      const provider = new JwtTokenProvider(secret);
      // Generate token expiring in negative minutes
      const token = provider.generateToken({ sub: "user-99" }, -5);

      expect(() => {
        provider.verifyToken(token);
      }).toThrow("Token expired");
    });
  });

  describe("RefreshTokenProvider & TokenValidator", () => {
    it("should generate random refresh token code structures", () => {
      const provider = new RefreshTokenProvider();
      const code = provider.generateRefreshToken();
      expect(code).toMatch(/^ref-/);
    });

    it("should wrap JWT verification inside TokenValidator class", () => {
      const provider = new JwtTokenProvider(secret);
      const validator = new TokenValidator(provider);
      const token = provider.generateToken({ sub: "user-7" }, 10);

      const payload = validator.validate(token);
      expect(payload.sub).toBe("user-7");
    });
  });

  describe("PasswordHasher PBKDF2 encryption", () => {
    it("should hash a password and confirm positive/negative matches correctly", () => {
      const hasher = new PasswordHasher();
      const rawPassword = "my-secure-password-123";

      const hash = hasher.hash(rawPassword);
      expect(hash).toBeDefined();
      expect(hash.split(":").length).toBe(2);

      // Positive match
      expect(hasher.verify(rawPassword, hash)).toBe(true);

      // Negative match
      expect(hasher.verify("wrong-password", hash)).toBe(false);
    });
  });

  describe("ApiKeyAuthenticator", () => {
    it("should register keys and assert authentications", () => {
      const auth = new ApiKeyAuthenticator();
      auth.registerKey("apikey-trusted-client-abc");

      expect(auth.authenticate("apikey-trusted-client-abc")).toBe(true);
      expect(auth.authenticate("apikey-malicious-attacker")).toBe(false);
    });
  });

  describe("SessionManager", () => {
    it("should track session tokens lifecycles", () => {
      const sm = new SessionManager();
      const token = "jwt.session.token";

      expect(sm.isSessionActive(token)).toBe(false);

      sm.startSession(token);
      expect(sm.isSessionActive(token)).toBe(true);

      sm.endSession(token);
      expect(sm.isSessionActive(token)).toBe(false);
    });
  });

  describe("ClaimsMapper & AuthenticationService workflow", () => {
    it("should map payload claims into AuthenticationContext attributes", () => {
      const claims = { sub: "user-44", role: "moderator", permissions: ["write"], orgId: "org-100" };
      const mapper = new ClaimsMapper();

      const ctx = mapper.map(claims, "token-string");
      expect(ctx).toBeInstanceOf(AuthenticationContext);
      expect(ctx.props.isAuthenticated).toBe(true);
      expect(ctx.props.user).toEqual({ id: "user-44", role: "moderator", permissions: ["write"] });
      expect(ctx.props.organizationId).toBe("org-100");
      expect(ctx.props.token).toBe("token-string");
    });

    it("should authenticate active tokens or yield unauthenticated context fallback", () => {
      const jwt = new JwtTokenProvider(secret);
      const validator = new TokenValidator(jwt);
      const mapper = new ClaimsMapper();
      const service = new AuthenticationService(validator, mapper);

      // Valid Authentication flow
      const token = jwt.generateToken({ sub: "user-11" }, 15);
      const authCtx = service.authenticate(token);
      expect(authCtx.props.isAuthenticated).toBe(true);
      expect(authCtx.props.user?.id).toBe("user-11");

      // Invalid flow
      const badCtx = service.authenticate("invalid-malformed-token");
      expect(badCtx.props.isAuthenticated).toBe(false);
    });
  });

  describe("AuthenticationRegistry and AuthenticationFactory instantiators", () => {
    it("should register and resolve providers inside static registries catalog", () => {
      const mockProvider = { auth: true };
      AuthenticationRegistry.register("MockAuth", mockProvider);

      expect(AuthenticationRegistry.getProvider("MockAuth")).toBe(mockProvider);
    });

    it("should instantiate all authentication providers via Factory helper", () => {
      const jwt = AuthenticationFactory.createJwtTokenProvider(secret);
      expect(jwt).toBeInstanceOf(JwtTokenProvider);

      const val = AuthenticationFactory.createTokenValidator(jwt);
      expect(val).toBeInstanceOf(TokenValidator);

      const mapper = AuthenticationFactory.createClaimsMapper();
      expect(mapper).toBeInstanceOf(ClaimsMapper);

      const svc = AuthenticationFactory.createService(val, mapper);
      expect(svc).toBeInstanceOf(AuthenticationService);

      expect(AuthenticationFactory.createSessionManager()).toBeInstanceOf(SessionManager);
      expect(AuthenticationFactory.createPasswordHasher()).toBeInstanceOf(PasswordHasher);
      expect(AuthenticationFactory.createApiKeyAuthenticator()).toBeInstanceOf(ApiKeyAuthenticator);
    });
  });
});
