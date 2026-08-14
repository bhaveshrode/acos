import { describe, it, expect, beforeEach } from "vitest";
import { InterceptorContext } from "../InterceptorContext.js";
import { InterceptorResult } from "../InterceptorResult.js";
import { LoggingInterceptor } from "../LoggingInterceptor.js";
import { CachingInterceptor } from "../CachingInterceptor.js";
import { TimeoutInterceptor } from "../TimeoutInterceptor.js";
import { RetryInterceptor } from "../RetryInterceptor.js";
import { TransformationInterceptor } from "../TransformationInterceptor.js";
import { InterceptorPipeline } from "../InterceptorPipeline.js";
import { InterceptorExecutor } from "../InterceptorExecutor.js";
import { InterceptorRegistry } from "../InterceptorRegistry.js";
import { InterceptorFactory } from "../InterceptorFactory.js";

describe("Presentation Interceptors Component Tests (Task 57.6)", () => {
  beforeEach(() => {
    InterceptorRegistry.clear();
    CachingInterceptor.clear();
  });

  describe("Models & Context", () => {
    it("should initialize InterceptorContext and InterceptorResult properties correctly", () => {
      const ctx = new InterceptorContext({ path: "/" }, { sent: false });
      expect(ctx.request.path).toBe("/");
      expect(ctx.response.sent).toBe(false);
      expect(ctx.metadata).toEqual({});

      const nextRes = InterceptorResult.next();
      expect(nextRes.handled).toBe(false);
      expect(nextRes.shortCircuit).toBe(false);

      const abortRes = InterceptorResult.shortCircuit({ val: 1 });
      expect(abortRes.handled).toBe(true);
      expect(abortRes.shortCircuit).toBe(true);
      expect(abortRes.value).toEqual({ val: 1 });
    });
  });

  describe("Concrete Interceptor Types", () => {
    it("should measure execution duration using LoggingInterceptor", async () => {
      const interceptor = new LoggingInterceptor();
      const ctx = new InterceptorContext({}, {});

      const result = await interceptor.intercept(ctx, async () => {
        return "success";
      });

      expect(result).toBe("success");
      expect(ctx.metadata.durationMs).toBeDefined();
      expect(ctx.metadata.durationMs).toBeGreaterThanOrEqual(0);
    });

    it("should serve cached results or store values using CachingInterceptor", async () => {
      const interceptor = new CachingInterceptor();

      const ctx1 = new InterceptorContext({ url: "/cache-x", headers: {} }, {});
      const res1 = await interceptor.intercept(ctx1, async () => "value-1");
      expect(res1).toBe("value-1");
      expect(ctx1.metadata.fromCache).toBeUndefined();

      const ctx2 = new InterceptorContext({ url: "/cache-x", headers: {} }, {});
      const res2 = await interceptor.intercept(ctx2, async () => "value-2");
      expect(res2).toBe("value-1");
      expect(ctx2.metadata.fromCache).toBe(true);
    });

    it("should enforce execution duration limits using TimeoutInterceptor", async () => {
      const interceptor = new TimeoutInterceptor(50);
      const ctx = new InterceptorContext({}, {});

      const fastRes = await interceptor.intercept(ctx, async () => "fast");
      expect(fastRes).toBe("fast");

      await expect(
        interceptor.intercept(ctx, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return "slow";
        })
      ).rejects.toThrow("Request Timeout Interception");
    });

    it("should retry operations upon transient failures using RetryInterceptor", async () => {
      const interceptor = new RetryInterceptor(2);
      const ctx = new InterceptorContext({}, {});

      let attempts = 0;
      const res = await interceptor.intercept(ctx, async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error("transient");
        }
        return "resolved";
      });

      expect(res).toBe("resolved");
      expect(ctx.metadata.retryAttempts).toBe(2);

      let failAttempts = 0;
      await expect(
        interceptor.intercept(ctx, async () => {
          failAttempts++;
          throw new Error("permanent");
        })
      ).rejects.toThrow("permanent");
      expect(failAttempts).toBe(3); // Initial + 2 retries
    });

    it("should reshape returned payloads using TransformationInterceptor", async () => {
      const interceptor = new TransformationInterceptor();
      const ctx = new InterceptorContext({}, {});

      const res = await interceptor.intercept(ctx, async () => {
        return { data: "ACOS" };
      });

      expect(res).toEqual({ data: "ACOS", transformed: true });
      expect(ctx.metadata.transformed).toBe(true);
    });
  });

  describe("Pipeline & Executor coordination", () => {
    it("should register interceptors priority sorted order", () => {
      const pipeline = new InterceptorPipeline();
      const i1 = new LoggingInterceptor();
      const i2 = new TransformationInterceptor();

      pipeline.register(i2, 20);
      pipeline.register(i1, 10);

      const interceptors = pipeline.getInterceptors();
      expect(interceptors[0]).toBe(i1);
      expect(interceptors[1]).toBe(i2);
    });

    it("should run executor pipelines sequentially invoking next chains hooks", async () => {
      const pipeline = new InterceptorPipeline();
      pipeline.register(new LoggingInterceptor(), 1);
      pipeline.register(new TransformationInterceptor(), 2);

      const executor = new InterceptorExecutor(pipeline);
      const ctx = new InterceptorContext({}, {});

      const res = await executor.execute(ctx, async () => {
        return { value: 100 };
      });

      expect(res).toEqual({ value: 100, transformed: true });
      expect(ctx.metadata.durationMs).toBeDefined();
      expect(ctx.metadata.transformed).toBe(true);
    });
  });

  describe("Registries & Factories setups", () => {
    it("should maintain global registries lists", () => {
      const interceptor = new LoggingInterceptor();
      expect(InterceptorRegistry.getGlobal().length).toBe(0);

      InterceptorRegistry.registerGlobal(interceptor, 10);
      expect(InterceptorRegistry.getGlobal()[0]).toBe(interceptor);
    });

    it("should instantiate interceptors configurations using InterceptorFactory", () => {
      expect(InterceptorFactory.createPipeline()).toBeInstanceOf(InterceptorPipeline);
      expect(InterceptorFactory.createExecutor(new InterceptorPipeline())).toBeInstanceOf(InterceptorExecutor);
      expect(InterceptorFactory.createLoggingInterceptor()).toBeInstanceOf(LoggingInterceptor);
      expect(InterceptorFactory.createCachingInterceptor()).toBeInstanceOf(CachingInterceptor);
      expect(InterceptorFactory.createTimeoutInterceptor()).toBeInstanceOf(TimeoutInterceptor);
      expect(InterceptorFactory.createRetryInterceptor()).toBeInstanceOf(RetryInterceptor);
      expect(InterceptorFactory.createTransformationInterceptor()).toBeInstanceOf(TransformationInterceptor);
    });
  });
});
