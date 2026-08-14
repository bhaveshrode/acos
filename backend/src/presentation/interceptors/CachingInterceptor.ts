import { IInterceptor } from "./IInterceptor.js";
import { InterceptorContext } from "./InterceptorContext.js";

/**
 * CachingInterceptor caching successful results.
 */
export class CachingInterceptor implements IInterceptor {
  private static cache = new Map<string, any>();

  public async intercept(context: InterceptorContext, next: () => Promise<any>): Promise<any> {
    const key = context.request.url || "default-key";
    if (context.request.headers?.["cache-control"] !== "no-cache" && CachingInterceptor.cache.has(key)) {
      context.metadata.fromCache = true;
      return CachingInterceptor.cache.get(key);
    }
    const result = await next();
    CachingInterceptor.cache.set(key, result);
    return result;
  }

  /**
   * Clears cache entries.
   */
  public static clear(): void {
    this.cache.clear();
  }
}
