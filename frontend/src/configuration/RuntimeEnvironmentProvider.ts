/**
 * RuntimeEnvironmentProvider resolving env variables across different client runtimes.
 */
export class RuntimeEnvironmentProvider {
  public getEnvironmentVariables(): Record<string, any> {
    return (
      (typeof window !== "undefined" && (window as any).env) ||
      (typeof process !== "undefined" && process.env) ||
      {}
    );
  }
}
