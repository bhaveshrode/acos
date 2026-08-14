/**
 * ResiliencePolicy offering customizable Retry counts, CircuitBreaker states, and Timeout races.
 */
export class ResiliencePolicy {
  public circuitOpen: boolean = false;
  private failureCount: number = 0;

  constructor(
    public readonly maxRetries: number = 3,
    public readonly timeoutMs: number = 1000,
    public readonly failureThreshold: number = 2
  ) {}

  public async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.circuitOpen) {
      throw new Error("Circuit breaker is OPEN");
    }

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        let timer: any;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Timeout")), this.timeoutMs);
        });
        const result = await Promise.race([
          action().then((val) => {
            clearTimeout(timer);
            return val;
          }),
          timeoutPromise
        ]);
        this.failureCount = 0;
        return result;
      } catch (err: any) {
        attempt++;
        if (err.message === "Timeout" || attempt >= this.maxRetries) {
          this.failureCount++;
          if (this.failureCount >= this.failureThreshold) {
            this.circuitOpen = true;
          }
          throw err;
        }
      }
    }
    throw new Error("Action failed after max retries");
  }

  public reset(): void {
    this.circuitOpen = false;
    this.failureCount = 0;
  }
}
