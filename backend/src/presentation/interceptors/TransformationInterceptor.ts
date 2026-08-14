import { IInterceptor } from "./IInterceptor.js";
import { InterceptorContext } from "./InterceptorContext.js";

/**
 * TransformationInterceptor reshaping execution values before response serialization.
 */
export class TransformationInterceptor implements IInterceptor {
  public async intercept(context: InterceptorContext, next: () => Promise<any>): Promise<any> {
    const result = await next();
    context.metadata.transformed = true;
    if (result && typeof result === "object" && !result.transformed) {
      return { ...result, transformed: true };
    }
    return result;
  }
}
