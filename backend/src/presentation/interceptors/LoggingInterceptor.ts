import { IInterceptor } from "./IInterceptor.js";
import { InterceptorContext } from "./InterceptorContext.js";

/**
 * LoggingInterceptor recording diagnostics and execution times.
 */
export class LoggingInterceptor implements IInterceptor {
  public async intercept(context: InterceptorContext, next: () => Promise<any>): Promise<any> {
    const startTime = Date.now();
    const result = await next();
    context.metadata.durationMs = Date.now() - startTime;
    return result;
  }
}
