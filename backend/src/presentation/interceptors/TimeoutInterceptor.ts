import { IInterceptor } from "./IInterceptor.js";
import { InterceptorContext } from "./InterceptorContext.js";

/**
 * TimeoutInterceptor enforcing maximum request time frames.
 */
export class TimeoutInterceptor implements IInterceptor {
  constructor(private readonly timeoutMs: number = 1000) {}

  public async intercept(context: InterceptorContext, next: () => Promise<any>): Promise<any> {
    let timer: any;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error("Request Timeout Interception"));
      }, this.timeoutMs);
    });

    try {
      return await Promise.race([next(), timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  }
}
