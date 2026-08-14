import { describe, it, expect, beforeEach } from "vitest";
import { PresentationFactory } from "../factories/index.js";
import { ConfigurationRegistry, ConfigurationBuilder, ConfigurationCache, JsonConfigurationLoader } from "../configuration/index.js";
import { HttpServer, ServerBuilder, ServerState } from "../server/index.js";
import { RequestBinder, RequestBuilder, RequestNormalizer, RequestMetadataBuilder } from "../requests/index.js";
import { JwtTokenProvider, ClaimsPrincipalBuilder } from "../authentication/index.js";
import { AuthorizationEvaluator, RoleRequirement, PermissionRequirement, AuthorizationPolicy, AuthorizationContext } from "../authorization/index.js";
import { RoleAuthorizationHandler, PermissionAuthorizationHandler } from "../authorization/AuthorizationHandler.js";
import { RequestValidator, ValidationSchema, RequiredRule } from "../validation/index.js";
import { SuccessResponseBuilder, PagedResponseBuilder } from "../responses/index.js";
import { MiddlewarePipeline, MiddlewareContext } from "../middleware/index.js";
import { FilterPipeline, FilterExecutor, FilterContext, AuthorizationFilter } from "../filters/index.js";
import { InterceptorPipeline, InterceptorExecutor, InterceptorContext, LoggingInterceptor } from "../interceptors/index.js";
import { HealthCheckRegistry, HealthCheckRunner, DatabaseHealthCheck } from "../health/index.js";
import { OpenApiBuilder, DocumentationRegistry, ApiDocument } from "../documentation/index.js";
import { ConnectionRegistry, ConnectionManager, WebSocketContext } from "../websocket/index.js";

describe("Presentation Layer E2E Integration Suite (Task 60.1)", () => {
  const secret = "acos-secret-key-123456789-super-long-required-signing-key";

  beforeEach(() => {
    ConfigurationRegistry.clear();
    ConfigurationCache.clear();
  });

  it("should validate the complete Presentation Layer request/response pipeline and composition root", async () => {
    // 1. Composition & Initialization Root
    expect(PresentationFactory.getControllers()).toBeDefined();
    expect(PresentationFactory.getRoutes()).toBeDefined();
    expect(PresentationFactory.getRequests()).toBeDefined();
    expect(PresentationFactory.getFilters()).toBeDefined();

    // 2. Configuration Bootstrapping
    const jsonStr = JSON.stringify({
      server: { port: 8080, host: "localhost", bodyLimit: "5mb" },
      security: { jwtSecret: secret, tokenLifetimeSeconds: 1800 }
    });
    ConfigurationRegistry.register(new JsonConfigurationLoader(jsonStr));
    const configBuilder = new ConfigurationBuilder();
    const config = configBuilder.build();
    expect(config.server.port).toBe(8080);
    expect(ConfigurationCache.get()).toStrictEqual(config);

    // 3. HTTP Request & Binding Engine
    const requestMock = {
      body: { name: "ACOS integration", count: "100" },
      query: { page: "2" },
      params: { id: "cust-99" },
      headers: { authorization: "Bearer some-token" }
    };
    const apiReq = new RequestBuilder().build(requestMock);
    const normalizedQuery = new RequestNormalizer().normalize(apiReq.query);
    expect(normalizedQuery.page).toBe(2);

    const binder = new RequestBinder();
    const bound = binder.bind(requestMock);
    expect(bound.id).toBe("cust-99");
    expect(bound.name).toBe("ACOS integration");

    // 4. Input Schema Rules Validation
    const schema = new ValidationSchema({
      name: { rules: [new RequiredRule()] }
    });
    const validator = new RequestValidator();
    const valCtx = await validator.validate(bound, schema);
    expect(valCtx.isValid()).toBe(true);

    // 5. Security Token Verification (AuthN & AuthZ)
    const tokenProvider = new JwtTokenProvider(secret);
    const claims = { sub: "user-1", role: "Admin", permissions: ["write:customers"] };
    const token = tokenProvider.generateToken(claims, 15);
    expect(token).toBeDefined();

    const validatedClaims = tokenProvider.verifyToken(token);
    expect(validatedClaims.sub).toBe("user-1");

    const principal = new ClaimsPrincipalBuilder().build(validatedClaims);
    expect(principal.id).toBe("user-1");

    const handlers = [
      new RoleAuthorizationHandler(),
      new PermissionAuthorizationHandler()
    ];
    const authzEvaluator = new AuthorizationEvaluator(handlers);
    const policy = new AuthorizationPolicy("AdminOnly", [
      new RoleRequirement("Admin"),
      new PermissionRequirement("write:customers")
    ]);
    const authzContext = new AuthorizationContext({
      userId: principal.id,
      roles: [principal.role],
      permissions: principal.permissions,
      resourceId: "customers"
    });
    const isAuthorized = await authzEvaluator.evaluate(policy, authzContext);
    expect(isAuthorized).toBe(true);

    // 6. Middleware execution
    const pipeline = new MiddlewarePipeline();
    const mCtx: MiddlewareContext = { req: requestMock, res: {}, state: {} };
    let finalHandlerInvoked = false;
    await pipeline.execute(mCtx, async () => {
      finalHandlerInvoked = true;
    });
    expect(finalHandlerInvoked).toBe(true);

    // 7. Filter Pipelines
    const filterPipeline = new FilterPipeline();
    filterPipeline.register(new AuthorizationFilter(), 1);
    const filterExecutor = new FilterExecutor(filterPipeline);
    const fCtx = new FilterContext(requestMock, {});
    const filterResult = await filterExecutor.execute(fCtx);
    expect(filterResult.shortCircuit).toBe(false);

    // 8. Interceptor Pipeline
    const interceptorPipeline = new InterceptorPipeline();
    interceptorPipeline.register(new LoggingInterceptor(), 1);
    const interceptorExecutor = new InterceptorExecutor(interceptorPipeline);
    const iCtx = new InterceptorContext(requestMock, {});
    let actionInvoked = false;
    const responsePayload = await interceptorExecutor.execute(iCtx, async () => {
      actionInvoked = true;
      return { status: "processed" };
    });
    expect(actionInvoked).toBe(true);
    expect(responsePayload).toEqual({ status: "processed" });
    expect(iCtx.metadata.durationMs).toBeDefined();

    // 9. Standardized Response Serialization
    const successRes = new SuccessResponseBuilder().build({ id: 1, title: "Invoice" });
    expect(successRes.data).toEqual({ id: 1, title: "Invoice" });

    const pagedRes = new PagedResponseBuilder().build(
      [{ id: 1 }],
      1,
      10,
      100,
      "/invoices"
    );
    expect(pagedRes.pagination.page).toBe(1);
    expect(pagedRes.pagination.totalPages).toBe(10);

    // 10. Health check endpoint aggregates
    HealthCheckRegistry.clear();
    const dbCheck = new DatabaseHealthCheck({ ping: async () => {} } as any);
    HealthCheckRegistry.register(dbCheck);
    const healthRunner = new HealthCheckRunner(HealthCheckRegistry.getChecks());
    const report = await healthRunner.run();
    expect(report[0].status).toBe("Healthy");

    // 11. OpenAPI generation spec sheets
    const doc = new ApiDocument("ACOS E2E Spec", "v1.0", [], []);
    const openApi = new OpenApiBuilder().build(doc);
    expect(openApi.info.title).toBe("ACOS E2E Spec");

    // 12. WebSocket Messaging handshakes
    ConnectionRegistry.clear();
    const wsManager = new ConnectionManager();
    const mockSocket = {};
    const wsCtx = wsManager.connect("conn-1", mockSocket);
    expect(ConnectionRegistry.get("conn-1")).toBeDefined();
    wsManager.disconnect("conn-1");
    expect(ConnectionRegistry.get("conn-1")).toBeUndefined();
  });
});
