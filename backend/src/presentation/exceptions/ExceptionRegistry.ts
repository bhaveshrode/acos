/**
 * ExceptionRegistry catalog ledger mapping custom error names to specific HTTP status codes.
 */
export class ExceptionRegistry {
  private static customCodes = new Map<string, number>();

  public static register(errorName: string, statusCode: number): void {
    this.customCodes.set(errorName, statusCode);
  }

  public static getStatusCode(errorName: string): number | undefined {
    return this.customCodes.get(errorName);
  }

  /**
   * Resets registry records.
   */
  public static clear(): void {
    this.customCodes.clear();
  }
}
