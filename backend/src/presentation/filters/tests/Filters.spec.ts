import { describe, it, expect, beforeEach } from "vitest";
import { FilterContext } from "../FilterContext.js";
import { FilterResult } from "../FilterResult.js";
import { AuthorizationFilter } from "../AuthorizationFilter.js";
import { ValidationFilter } from "../ValidationFilter.js";
import { ActionFilter } from "../ActionFilter.js";
import { ResultFilter } from "../ResultFilter.js";
import { ExceptionFilter } from "../ExceptionFilter.js";
import { FilterPipeline } from "../FilterPipeline.js";
import { FilterExecutor } from "../FilterExecutor.js";
import { FilterRegistry } from "../FilterRegistry.js";
import { FilterFactory } from "../FilterFactory.js";

describe("Presentation Filters Component Tests (Task 56.6)", () => {
  beforeEach(() => {
    FilterRegistry.clear();
  });

  describe("Models & Context", () => {
    it("should initialize FilterContext and FilterResult properties correctly", () => {
      const ctx = new FilterContext({ path: "/" }, { sent: false });
      expect(ctx.request.path).toBe("/");
      expect(ctx.response.sent).toBe(false);
      expect(ctx.metadata).toEqual({});

      const nextRes = FilterResult.next();
      expect(nextRes.handled).toBe(false);
      expect(nextRes.shortCircuit).toBe(false);

      const abortRes = FilterResult.shortCircuit(403, { err: "denied" });
      expect(abortRes.handled).toBe(true);
      expect(abortRes.shortCircuit).toBe(true);
      expect(abortRes.statusCode).toBe(403);
      expect(abortRes.payload).toEqual({ err: "denied" });
    });
  });

  describe("Concrete Filters Types", () => {
    it("should enforce authorization checks via AuthorizationFilter", async () => {
      const filter = new AuthorizationFilter();

      const allowCtx = new FilterContext({ headers: { authorization: "Bearer token" } }, {});
      const allowRes = await filter.execute(allowCtx);
      expect(allowRes.shortCircuit).toBe(false);

      const denyCtx = new FilterContext({ headers: { authorization: "deny" } }, {});
      const denyRes = await filter.execute(denyCtx);
      expect(denyRes.shortCircuit).toBe(true);
      expect(denyRes.statusCode).toBe(401);
    });

    it("should validate payloads properties via ValidationFilter", async () => {
      const filter = new ValidationFilter();

      const okCtx = new FilterContext({ body: { email: "a@b.com" } }, {});
      const okRes = await filter.execute(okCtx);
      expect(okRes.shortCircuit).toBe(false);

      const errCtx = new FilterContext({ body: { invalidField: true } }, {});
      const errRes = await filter.execute(errCtx);
      expect(errRes.shortCircuit).toBe(true);
      expect(errRes.statusCode).toBe(400);
    });

    it("should process actions lifecycle metrics via ActionFilter", async () => {
      const filter = new ActionFilter();
      const ctx = new FilterContext({}, {});

      expect(ctx.metadata.actionStarted).toBeUndefined();
      await filter.execute(ctx);
      expect(ctx.metadata.actionStarted).toBe(true);
    });

    it("should decorate response payload targets via ResultFilter", async () => {
      const filter = new ResultFilter();
      const ctx = new FilterContext({}, {});

      expect(ctx.metadata.resultProcessed).toBeUndefined();
      await filter.execute(ctx);
      expect(ctx.metadata.resultProcessed).toBe(true);
    });

    it("should intercept uncaught errors details via ExceptionFilter", async () => {
      const filter = new ExceptionFilter();

      const okCtx = new FilterContext({}, {});
      const okRes = await filter.execute(okCtx);
      expect(okRes.shortCircuit).toBe(false);

      const errCtx = new FilterContext({}, {});
      errCtx.metadata.exception = new Error("db failure");
      const errRes = await filter.execute(errCtx);
      expect(errRes.shortCircuit).toBe(true);
      expect(errRes.statusCode).toBe(500);
      expect(errRes.payload.error).toBe("db failure");
    });
  });

  describe("Pipeline & Executor coordination", () => {
    it("should register filters priority sorted order", () => {
      const pipeline = new FilterPipeline();
      const f1 = new ActionFilter();
      const f2 = new ResultFilter();

      pipeline.register(f2, 10);
      pipeline.register(f1, 5);

      const filters = pipeline.getFilters();
      expect(filters[0]).toBe(f1);
      expect(filters[1]).toBe(f2);
    });

    it("should run executor pipelines short-circuiting where configured", async () => {
      const pipeline = new FilterPipeline();
      pipeline.register(new AuthorizationFilter(), 1);
      pipeline.register(new ActionFilter(), 2);

      const executor = new FilterExecutor(pipeline);

      const denyCtx = new FilterContext({ headers: { authorization: "deny" } }, {});
      const denyRes = await executor.execute(denyCtx);
      expect(denyRes.shortCircuit).toBe(true);
      expect(denyCtx.metadata.actionStarted).toBeUndefined();

      const allowCtx = new FilterContext({ headers: { authorization: "allow" } }, {});
      const allowRes = await executor.execute(allowCtx);
      expect(allowRes.shortCircuit).toBe(false);
      expect(allowCtx.metadata.actionStarted).toBe(true);
    });
  });

  describe("Registries & Factories setups", () => {
    it("should maintain global registries lists", () => {
      const filter = new ActionFilter();
      expect(FilterRegistry.getGlobal().length).toBe(0);

      FilterRegistry.registerGlobal(filter, 10);
      expect(FilterRegistry.getGlobal()[0]).toBe(filter);
    });

    it("should instantiate filters pipelines using FilterFactory", () => {
      expect(FilterFactory.createPipeline()).toBeInstanceOf(FilterPipeline);
      expect(FilterFactory.createExecutor(new FilterPipeline())).toBeInstanceOf(FilterExecutor);
      expect(FilterFactory.createAuthorizationFilter()).toBeInstanceOf(AuthorizationFilter);
      expect(FilterFactory.createValidationFilter()).toBeInstanceOf(ValidationFilter);
      expect(FilterFactory.createActionFilter()).toBeInstanceOf(ActionFilter);
      expect(FilterFactory.createResultFilter()).toBeInstanceOf(ResultFilter);
      expect(FilterFactory.createExceptionFilter()).toBeInstanceOf(ExceptionFilter);
    });
  });
});
