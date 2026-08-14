import { InterceptorPipeline } from "./InterceptorPipeline.js";
import { InterceptorExecutor } from "./InterceptorExecutor.js";
import { LoggingInterceptor } from "./LoggingInterceptor.js";
import { CachingInterceptor } from "./CachingInterceptor.js";
import { TimeoutInterceptor } from "./TimeoutInterceptor.js";
import { RetryInterceptor } from "./RetryInterceptor.js";
import { TransformationInterceptor } from "./TransformationInterceptor.js";

/**
 * InterceptorFactory constructing executors, pipelines, and interceptors.
 */
export class InterceptorFactory {
  public static createPipeline(): InterceptorPipeline {
    return new InterceptorPipeline();
  }

  public static createExecutor(pipeline: InterceptorPipeline): InterceptorExecutor {
    return new InterceptorExecutor(pipeline);
  }

  public static createLoggingInterceptor(): LoggingInterceptor {
    return new LoggingInterceptor();
  }

  public static createCachingInterceptor(): CachingInterceptor {
    return new CachingInterceptor();
  }

  public static createTimeoutInterceptor(timeoutMs?: number): TimeoutInterceptor {
    return new TimeoutInterceptor(timeoutMs);
  }

  public static createRetryInterceptor(retries?: number): RetryInterceptor {
    return new RetryInterceptor(retries);
  }

  public static createTransformationInterceptor(): TransformationInterceptor {
    return new TransformationInterceptor();
  }
}
