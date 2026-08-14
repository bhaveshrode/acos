export class RecoveryEngine {
  public async retry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delayMs = 50
  ): Promise<T> {
    let lastError: any;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
        }
      }
    }
    throw new Error(`Execution failed after ${retries} attempts. Last error: ${lastError?.message || lastError}`);
  }
}
