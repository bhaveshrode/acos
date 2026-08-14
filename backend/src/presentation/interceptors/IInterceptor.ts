import { InterceptorContext } from "./InterceptorContext.js";

/**
 * IInterceptor defining the async request interceptor execution contract.
 */
export interface IInterceptor {
  intercept(context: InterceptorContext, next: () => Promise<any>): Promise<any>;
}
