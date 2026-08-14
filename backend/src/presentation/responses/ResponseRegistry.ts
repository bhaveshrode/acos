import { ApiResponse } from "./ApiResponse.js";

/**
 * ResponseRegistry maintaining reusable response templates.
 */
export class ResponseRegistry {
  private static templates = new Map<string, ApiResponse<any>>();

  public static register(name: string, response: ApiResponse<any>): void {
    this.templates.set(name, response);
  }

  public static get(name: string): ApiResponse<any> | undefined {
    return this.templates.get(name);
  }

  /**
   * Resets template mappings.
   */
  public static clear(): void {
    this.templates.clear();
  }
}
