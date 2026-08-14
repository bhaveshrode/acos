import { InterceptorPipeline } from "./InterceptorPipeline.js";
import { InterceptorContext } from "./InterceptorContext.js";

/**
 * InterceptorExecutor coordinating nested execution chains.
 */
export class InterceptorExecutor {
  constructor(private readonly pipeline: InterceptorPipeline) {}

  public async execute(context: InterceptorContext, action: () => Promise<any>): Promise<any> {
    const interceptors = this.pipeline.getInterceptors();
    let index = 0;

    const chainNext = async (): Promise<any> => {
      if (index < interceptors.length) {
        const interceptor = interceptors[index++];
        return await interceptor.intercept(context, chainNext);
      }
      return await action();
    };

    return await chainNext();
  }
}
