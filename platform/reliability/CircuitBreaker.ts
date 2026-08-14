export class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount = 0;
  private lastStateChange: Date = new Date();

  constructor(
    private readonly thresholdCount = 3,
    private readonly resetTimeoutMs = 1000
  ) {}

  public async execute<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    if (this.state === "OPEN") {
      const now = Date.now();
      if (now - this.lastStateChange.getTime() > this.resetTimeoutMs) {
        this.state = "HALF_OPEN";
        this.lastStateChange = new Date();
      } else {
        return fallback;
      }
    }

    try {
      const result = await fn();
      if (this.state === "HALF_OPEN") {
        this.state = "CLOSED";
        this.failureCount = 0;
        this.lastStateChange = new Date();
      }
      return result;
    } catch (error) {
      this.failureCount++;
      if (this.failureCount >= this.thresholdCount) {
        this.state = "OPEN";
        this.lastStateChange = new Date();
      }
      throw error;
    }
  }

  public getState(): "CLOSED" | "OPEN" | "HALF_OPEN" {
    return this.state;
  }
}
