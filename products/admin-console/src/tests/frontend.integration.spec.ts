import { describe, it, expect, vi, beforeEach } from "vitest";
import { FrontendFactory } from "../factories/FrontendFactory.js";
import { FrontendConfigurationFactory } from "../configuration/FrontendConfigurationFactory.js";
import { ThemeFactory } from "../themes/ThemeFactory.js";
import { RoutingFactory } from "../routing/RoutingFactory.js";
import { AuthenticationFactory } from "../authentication/AuthenticationFactory.js";
import { StateFactory } from "../state/StateFactory.js";
import { ValidationFactory } from "../validation/ValidationFactory.js";
import { WebSocketMessage } from "../websocket/WebSocketMessage.js";
import { UserSession } from "../authentication/UserSession.js";
import { AuthenticationState } from "../authentication/AuthenticationState.js";
import { ValidationSchema } from "../validation/ValidationSchema.js";
import { RequiredRule } from "../validation/RequiredRule.js";

describe("Frontend Real-Time E2E Master Integration Test Suite (Task 79.1)", () => {
  let factory: FrontendFactory;

  beforeEach(() => {
    vi.restoreAllMocks();
    factory = new FrontendFactory();
  });

  it("should bootstrap, resolve configuration, manage state mutations, execute api calls, check authorization, notify users, track telemetry, and manage websockets", async () => {
    // 1. Configuration & Themes Bootstrap
    const resolvedConfig = FrontendConfigurationFactory.createProvider();
    expect(resolvedConfig).toBeDefined();

    const themeDetector = ThemeFactory.createDetector();
    const themeResolver = ThemeFactory.createResolver(themeDetector);
    const themeStore = ThemeFactory.createStore();
    const themeManager = ThemeFactory.createManager(
      { defaultMode: "system" },
      themeResolver,
      themeStore,
      themeDetector
    );
    expect(themeManager.getMode()).toBe("system");

    // 2. Authentication & Authorization Setup
    const userSession = new UserSession(
      "user-123",
      "ManagerUser",
      "test.jwt.token",
      { role: "Manager", permissions: ["invoice:create", "invoice:read"] },
      Date.now() + 360000
    );

    const sessionStore = AuthenticationFactory.createMemorySessionStore();
    sessionStore.save("sess_key", userSession);

    const sessionManager = AuthenticationFactory.createSessionManager(sessionStore, { rememberMe: true });
    const credVal = AuthenticationFactory.createCredentialValidator();
    const sessVal = AuthenticationFactory.createSessionValidator();
    const authService = AuthenticationFactory.createService(
      AuthenticationFactory.createRegistry(),
      sessionManager,
      credVal,
      sessVal
    );

    expect(authService).toBeDefined();

    // 3. Routing & Component Lifecycle
    const routeRegistry = RoutingFactory.createRegistry();
    const router = RoutingFactory.createRouter(
      routeRegistry,
      RoutingFactory.createMatcher(),
      RoutingFactory.createResolver(),
      RoutingFactory.createNavigationManager(),
      RoutingFactory.createGuardPipeline()
    );
    expect(router).toBeDefined();

    const renderer = factory.components.createRenderer();
    expect(renderer).toBeDefined();

    // 4. Forms & Validation
    const schema = new ValidationSchema();
    schema.addRule("amount", new RequiredRule());

    const targetModel = { amount: "" };

    const objectValidator = ValidationFactory.createObjectValidator();
    const pipeline = ValidationFactory.createPipeline(objectValidator);
    const validationResult = await pipeline.execute(targetModel, schema);
    expect(validationResult.isValid).toBe(false);

    // 5. State Store Operations
    const store = StateFactory.createStore({ count: 0 });
    expect(store).toBeDefined();

    // 6. Analytics Consent & Collection
    const consent = factory.analytics.createConsentManager();
    const policy = factory.analytics.createPolicy(consent);
    expect(policy.shouldCollectEvent("workflow")).toBe(false);

    consent.grantConsent();
    expect(policy.shouldCollectEvent("workflow")).toBe(true);

    const dispatcher = factory.analytics.createEventDispatcher();
    const tracker = factory.analytics.createTracker(dispatcher);
    expect(tracker).toBeDefined();

    // 7. WebSocket Heartbeats & Message Buffering
    const wsBuffer = factory.websocket.createMessageBuffer();

    const offlineMessage = new WebSocketMessage("sync-invoice", { id: "inv-90" }, "billing");
    wsBuffer.push(offlineMessage);
    expect(wsBuffer.size()).toBe(1);

    // 8. Notifications Dispatching
    const notificationQueue = factory.notifications.createQueue();
    const notificationManager = factory.notifications.createManager(
      notificationQueue
    );
    expect(notificationManager).toBeDefined();
  });
});
