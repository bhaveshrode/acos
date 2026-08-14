/**
 * Utility class resolving the active environment of the execution context.
 */
export class EnvironmentDetector {
  /**
   * Retrieves the current environment string. Defaults to 'development'.
   */
  public static getEnvironment(): string {
    return (process.env.NODE_ENV || process.env.APP__ENVIRONMENT || "development").toLowerCase();
  }

  /**
   * Checks if running under development.
   */
  public static isDevelopment(): boolean {
    return this.getEnvironment() === "development";
  }

  /**
   * Checks if running under a testing runner.
   */
  public static isTesting(): boolean {
    const env = this.getEnvironment();
    return env === "test" || env === "testing";
  }

  /**
   * Checks if running under production.
   */
  public static isProduction(): boolean {
    return this.getEnvironment() === "production";
  }
}
