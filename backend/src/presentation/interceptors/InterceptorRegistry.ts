import { IInterceptor } from "./IInterceptor.js";

/**
 * InterceptorRegistry cataloging global interceptor entries.
 */
export class InterceptorRegistry {
  private static globalInterceptors: { interceptor: IInterceptor; order: number }[] = [];

  public static registerGlobal(interceptor: IInterceptor, order: number = 0): void {
    this.globalInterceptors.push({ interceptor, order });
    this.globalInterceptors.sort((a, b) => a.order - b.order);
  }

  public static getGlobal(): IInterceptor[] {
    return this.globalInterceptors.map((i) => i.interceptor);
  }

  /**
   * Resets registry records.
   */
  public static clear(): void {
    this.globalInterceptors = [];
  }
}
