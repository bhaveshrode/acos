import { describe, it, expect, beforeEach } from "vitest";
import { MiddlewareContext } from "../MiddlewareContext.js";
import { MiddlewarePipeline } from "../MiddlewarePipeline.js";
import { CorrelationMiddleware } from "../CorrelationMiddleware.js";
import { RequestIdMiddleware } from "../RequestIdMiddleware.js";
import { RequestContextMiddleware } from "../RequestContextMiddleware.js";
import { AuthenticationMiddleware } from "../AuthenticationMiddleware.js";
import { AuthorizationMiddleware } from "../AuthorizationMiddleware.js";
import { ExceptionHandlingMiddleware } from "../ExceptionHandlingMiddleware.js";
import { LoggingMiddleware } from "../LoggingMiddleware.js";
import { CorsMiddleware } from "../CorsMiddleware.js";
import { CompressionMiddleware } from "../CompressionMiddleware.js";
import { RateLimitingMiddleware } from "../RateLimitingMiddleware.js";
import { SecurityHeadersMiddleware } from "../SecurityHeadersMiddleware.js";
import { HealthCheckMiddleware } from "../HealthCheckMiddleware.js";
import { MiddlewareRegistry } from "../MiddlewareRegistry.js";
import { MiddlewareFactory } from "../MiddlewareFactory.js";
import { InMemoryIdempotencyStore } from "../idempotency/InMemoryIdempotencyStore.js";
import { IdempotencyMiddleware } from "../idempotency/IdempotencyMiddleware.js";
import { ControllerContext } from "../../controllers/ControllerContext.js";

describe("Presentation Middleware Component Tests (Task 41.7)", () => {
  let context: MiddlewareContext;

  beforeEach(() => {
    context = {
      req: {
        headers: {},
        ip: "127.0.0.1",
        url: "/api/v1/customers"
      },
      res: {
        headers: {},
        status: 200,
        body: null
      },
      state: {}
    };
    MiddlewareRegistry.clear();
  });

  describe("MiddlewarePipeline Execution", () => {
    it("should execute multiple middlewares sequentially and reach target action", async () => {
      const pipeline = new MiddlewarePipeline();
      const order: string[] = [];

      pipeline.use({
        handle: async (ctx, next) => {
          order.push("one");
          await next();
        }
      });

      pipeline.use({
        handle: async (ctx, next) => {
          order.push("two");
          await next();
        }
      });

      let targetInvoked = false;
      await pipeline.execute(context, async () => {
        targetInvoked = true;
      });

      expect(order).toEqual(["one", "two"]);
      expect(targetInvoked).toBe(true);
    });
  });

  describe("Tracking & Context Middlewares", () => {
    it("should generate correlation and request IDs or propagate header values", async () => {
      const corr = new CorrelationMiddleware();
      const reqId = new RequestIdMiddleware();

      // Test default generate fallback
      await corr.handle(context, async () => {});
      await reqId.handle(context, async () => {});

      expect(context.state.correlationId).toMatch(/^corr-/);
      expect(context.state.requestId).toMatch(/^req-/);

      // Test propagate incoming headers
      context.req.headers["x-correlation-id"] = "corr-header-123";
      context.req.headers["x-request-id"] = "req-header-456";

      await corr.handle(context, async () => {});
      await reqId.handle(context, async () => {});

      expect(context.state.correlationId).toBe("corr-header-123");
      expect(context.state.requestId).toBe("req-header-456");
    });

    it("should map dynamic contexts to ControllerContext instances", async () => {
      context.state.correlationId = "corr-777";
      context.state.requestId = "req-888";
      context.state.currentUser = { id: "user-bob", role: "auditor" };
      context.req.headers["x-organization-id"] = "org-999";

      const reqCtx = new RequestContextMiddleware();
      await reqCtx.handle(context, async () => {});

      const ctrlCtxObj = context.state.controllerContext;
      expect(ctrlCtxObj).toBeInstanceOf(ControllerContext);
      expect(ctrlCtxObj.props.correlationId).toBe("corr-777");
      expect(ctrlCtxObj.props.requestId).toBe("req-888");
      expect(ctrlCtxObj.props.currentUser).toEqual({ id: "user-bob", role: "auditor" });
      expect(ctrlCtxObj.props.organizationId).toBe("org-999");
      expect(ctrlCtxObj.props.ipAddress).toBe("127.0.0.1");
    });
  });

  describe("Authentication & Authorization Policies", () => {
    it("should resolve token details only when bearer headers are present", async () => {
      const auth = new AuthenticationMiddleware();

      // Mismatch authorization structure
      await auth.handle(context, async () => {});
      expect(context.state.currentUser).toBeUndefined();

      // Correct Bearer headers
      context.req.headers.authorization = "Bearer tokensignaturekeys";
      await auth.handle(context, async () => {});
      expect(context.state.currentUser).toEqual({ id: "user-123", role: "admin" });
    });

    it("should block request progression on mismatching authorization roles", async () => {
      const authz = new AuthorizationMiddleware("admin");

      // Anonymous blocked
      await expect(authz.handle(context, async () => {})).rejects.toThrow("Forbidden access");

      // Wrong role blocked
      context.state.currentUser = { id: "user-abc", role: "guest" };
      await expect(authz.handle(context, async () => {})).rejects.toThrow("Forbidden access");

      // Correct role passes
      context.state.currentUser = { id: "user-abc", role: "admin" };
      let passed = false;
      await authz.handle(context, async () => { passed = true; });
      expect(passed).toBe(true);
    });
  });

  describe("ExceptionHandling & Observability Metrics", () => {
    it("should catch errors in downstream middleware and return 500 response", async () => {
      const trap = new ExceptionHandlingMiddleware();

      await trap.handle(context, async () => {
        throw new Error("Relational database connection lost");
      });

      expect(context.res.status).toBe(500);
      expect(context.res.body).toEqual({ error: "Relational database connection lost" });
    });

    it("should record execution duration metric times", async () => {
      const logger = new LoggingMiddleware();

      await logger.handle(context, async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(context.state.executionDuration).toBeGreaterThanOrEqual(9);
    });
  });

  describe("HTTP Pipeline Filters", () => {
    it("should apply CORS, compression, security headers and rate limits", async () => {
      const cors = new CorsMiddleware();
      const compression = new CompressionMiddleware();
      const rateLimit = new RateLimitingMiddleware();
      const security = new SecurityHeadersMiddleware();

      await cors.handle(context, async () => {});
      await compression.handle(context, async () => {});
      await rateLimit.handle(context, async () => {});
      await security.handle(context, async () => {});

      expect(context.res.headers["Access-Control-Allow-Origin"]).toBe("*");
      expect(context.res.headers["Content-Encoding"]).toBe("gzip");
      expect(context.res.headers["X-RateLimit-Limit"]).toBe("100");
      expect(context.res.headers["X-Content-Type-Options"]).toBe("nosniff");
    });

    it("should intercept health/ready endpoints and bypass subsequent execution chain", async () => {
      const health = new HealthCheckMiddleware();

      // Normal path request passes
      let normalPassed = false;
      await health.handle(context, async () => { normalPassed = true; });
      expect(normalPassed).toBe(true);

      // Health path request intercepts and short circuits
      context.req.url = "/health";
      let healthPassed = false;
      await health.handle(context, async () => { healthPassed = true; });
      expect(healthPassed).toBe(false);
      expect(context.res.status).toBe(200);
      expect(context.res.body).toEqual({ status: "Healthy" });
    });
  });

  describe("MiddlewareRegistry and MiddlewareFactory helpers", () => {
    it("should register filters and factory constructs", () => {
      const middleware = MiddlewareFactory.createCorsMiddleware();
      MiddlewareRegistry.register(middleware);

      expect(MiddlewareRegistry.getPipeline()).toContain(middleware);
      expect(MiddlewareRegistry.getPipeline().length).toBe(1);

      expect(MiddlewareFactory.createCorrelationMiddleware()).toBeInstanceOf(CorrelationMiddleware);
      expect(MiddlewareFactory.createRequestIdMiddleware()).toBeInstanceOf(RequestIdMiddleware);
      expect(MiddlewareFactory.createRequestContextMiddleware()).toBeInstanceOf(RequestContextMiddleware);
      expect(MiddlewareFactory.createAuthenticationMiddleware()).toBeInstanceOf(AuthenticationMiddleware);
      expect(MiddlewareFactory.createAuthorizationMiddleware("admin")).toBeInstanceOf(AuthorizationMiddleware);
      expect(MiddlewareFactory.createExceptionHandlingMiddleware()).toBeInstanceOf(ExceptionHandlingMiddleware);
      expect(MiddlewareFactory.createLoggingMiddleware()).toBeInstanceOf(LoggingMiddleware);
      expect(MiddlewareFactory.createCorsMiddleware()).toBeInstanceOf(CorsMiddleware);
      expect(MiddlewareFactory.createCompressionMiddleware()).toBeInstanceOf(CompressionMiddleware);
      expect(MiddlewareFactory.createRateLimitingMiddleware()).toBeInstanceOf(RateLimitingMiddleware);
      expect(MiddlewareFactory.createSecurityHeadersMiddleware()).toBeInstanceOf(SecurityHeadersMiddleware);
      expect(MiddlewareFactory.createHealthCheckMiddleware()).toBeInstanceOf(HealthCheckMiddleware);
    });
  });

  describe("IdempotencyMiddleware (Task 4.2)", () => {
    let store: InMemoryIdempotencyStore;
    let middleware: IdempotencyMiddleware;

    beforeEach(() => {
      store = new InMemoryIdempotencyStore();
      middleware = new IdempotencyMiddleware(store);
    });

    it("should process and cache POST requests containing Idempotency-Key", async () => {
      context.req.method = "POST";
      context.req.headers["idempotency-key"] = "test-key-123";
      
      let nextCalled = false;
      await middleware.handle(context, async () => {
        nextCalled = true;
        // Mock route handler outputting JSON response
        context.res.status = 201;
        context.res.body = { message: "Created successfully" };
      });

      expect(nextCalled).toBe(true);
      expect(context.res.status).toBe(201);
      
      const cached = await store.get("test-key-123");
      expect(cached).not.toBeNull();
      expect(cached!.statusCode).toBe(201);
      expect(JSON.parse(cached!.responseBody)).toEqual({ message: "Created successfully" });
    });

    it("should short-circuit and serve cached responses for duplicate requests", async () => {
      context.req.method = "POST";
      context.req.headers["idempotency-key"] = "test-key-999";
      
      await store.save("test-key-999", 200, JSON.stringify({ cachedData: "yes" }));

      let nextCalled = false;
      await middleware.handle(context, async () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false); // Short-circuited!
      expect(context.res.status).toBe(200);
      expect(context.res.body).toEqual({ cachedData: "yes" });
    });
  });
});
