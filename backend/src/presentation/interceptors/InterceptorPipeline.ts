import { IInterceptor } from "./IInterceptor.js";

/**
 * InterceptorPipeline coordinating sequential execution orders.
 */
export class InterceptorPipeline {
  private interceptors: { interceptor: IInterceptor; order: number }[] = [];

  public register(interceptor: IInterceptor, order: number = 0): void {
    this.interceptors.push({ interceptor, order });
    this.interceptors.sort((a, b) => a.order - b.order);
  }

  public getInterceptors(): IInterceptor[] {
    return this.interceptors.map((i) => i.interceptor);
  }

  /**
   * Resets registered items.
   */
  public clear(): void {
    this.interceptors = [];
  }
}
