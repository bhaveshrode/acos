/**
 * HydrationResult modelling hydration outcome success, failures, and recovery types.
 */
export class HydrationResult {
  private constructor(
    public readonly success: boolean,
    public readonly status: "Success" | "Failed" | "Partial" | "Recovered",
    public readonly reason?: string
  ) {
    Object.freeze(this);
  }

  public static success(): HydrationResult {
    return new HydrationResult(true, "Success");
  }

  public static failed(reason: string): HydrationResult {
    return new HydrationResult(false, "Failed", reason);
  }

  public static recovered(reason: string): HydrationResult {
    return new HydrationResult(true, "Recovered", reason);
  }
}
