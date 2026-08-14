import { IInterceptor } from "./IInterceptor.js";
import { InterceptorContext } from "./InterceptorContext.js";

/**
 * RetryInterceptor retrying transient operations.
 */
export class RetryInterceptor implements IInterceptor {
  constructor(private readonly retries: number = 2) {}

  public async intercept(context: InterceptorContext, next: () => Promise<any>): Promise<any> {
    let attempts = 0;
    while (true) {
      try {
        return await next();
      } catch (error) {
        attempts++;
        if (attempts > this.retries) {
          throw error;
        }
        context.metadata.retryAttempts = attempts;
      }
    }
  }
}
