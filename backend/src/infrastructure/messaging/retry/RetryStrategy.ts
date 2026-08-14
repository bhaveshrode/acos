/**
 * Interface contract representing execution retry strategies.
 */
export interface IRetryStrategy {
  /**
   * Executes a callback operation using the active retry strategy algorithm.
   */
  execute<T>(operation: () => Promise<T>): Promise<T>;
}

/**
 * Fixed interval retry strategy.
 */
export class FixedRetryStrategy implements IRetryStrategy {
  constructor(
    private readonly maxAttempts: number = 3,
    private readonly delayMs: number = 100
  ) {}

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    let attempts = 0;
    while (true) {
      try {
        return await operation();
      } catch (error) {
        attempts++;
        if (attempts >= this.maxAttempts) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
    }
  }
}

/**
 * Exponential backoff interval retry strategy.
 */
export class ExponentialBackoffRetryStrategy implements IRetryStrategy {
  constructor(
    private readonly maxAttempts: number = 3,
    private readonly initialDelayMs: number = 100,
    private readonly multiplier: number = 2
  ) {}

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    let attempts = 0;
    let currentDelay = this.initialDelayMs;
    while (true) {
      try {
        return await operation();
      } catch (error) {
        attempts++;
        if (attempts >= this.maxAttempts) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= this.multiplier;
      }
    }
  }
}
